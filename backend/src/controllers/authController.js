const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate short-lived Access Token and long-lived Refresh Token
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// User registration
exports.register = async (req, res) => {
  const { email, password, department, role } = req.body;

  if (!email || !password || !department) {
    return res.status(400).json({ message: 'Enter required fields' });
  }

  const userRole = role === 'admin' ? 'admin' : 'employee';

  try {
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      'INSERT INTO users (email, password, department, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, department, userRole]
    );

    res.status(201).json({ message: 'User is created', userId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// User login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Enter email and password' });
  }

  try {
    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Incorrect data' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect data' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Hash refresh token before saving to database
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await db.execute('UPDATE users SET refresh_token = ? WHERE id = ?', [hashedRefreshToken, user.id]);

    // Set httpOnly Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      token: accessToken,
      role: user.role,
      department: user.department
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Access Token refresh
exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token not found' });
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const [users] = await db.execute('SELECT * FROM users WHERE id = ?', [payload.id]);
    if (users.length === 0 || !users[0].refresh_token) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    const user = users[0];
    const isTokenValid = await bcrypt.compare(refreshToken, user.refresh_token);

    if (!isTokenValid) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    // Issue new pair of tokens (Rotation)
    const tokens = generateTokens(user);
    const newHashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);

    await db.execute('UPDATE users SET refresh_token = ? WHERE id = ?', [newHashedRefreshToken, user.id]);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ token: tokens.accessToken });
  } catch (err) {
    return res.status(403).json({ message: 'Token expired or invalid' });
  }
};

// User logout
exports.logout = async (req, res) => {
  try {
    if (req.user && req.user.id) {
      await db.execute('UPDATE users SET refresh_token = NULL WHERE id = ?', [req.user.id]);
    }
    res.clearCookie('refreshToken', { path: '/' });
    res.json({ message: 'Successfully logged out' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};