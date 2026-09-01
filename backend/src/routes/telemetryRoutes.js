const express = require('express');
const { getSatelliteMetrics, getSatellitesList } = require('../controllers/telemetryController');

const router = express.Router();

const cacheMiddleware = require('../middlewares/cacheMiddleware');

router.get('/v1/satellites', getSatellitesList);
router.get('/v1', cacheMiddleware, getSatelliteMetrics);


module.exports = router;