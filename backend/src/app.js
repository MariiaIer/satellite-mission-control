const express = require('express');
const http = require('http');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const telemetryRoutes = require('./routes/telemetryRoutes');
const initWebSocketServer = require('./services/websocket'); // WS
require('dotenv').config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5000', // Shell
    'http://localhost:5001', // Auth
    'http://localhost:5002', // Admin
    'http://localhost:5003', // Shared
    'http://localhost:5004', // Angular tracker
  ],
  credentials: true
}));

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/metrics/', telemetryRoutes);

//  HTTP + WebSocket
const server = http.createServer(app);
initWebSocketServer(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`WebSocket Server is ready on ws://localhost:${PORT}`);
});