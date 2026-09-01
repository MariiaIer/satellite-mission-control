const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, checkRole } = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authenticateToken, authController.logout);

router.get('/admin', authenticateToken, checkRole(['admin']), (req, res) => {
  res.json({ message: 'Admin access only' });
});

module.exports = router;