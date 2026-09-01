// services/websocket.js
const { WebSocketServer, WebSocket } = require('ws');

// Constants and generators
const SPACE_SATELLITES = ['ISS', 'Hubble', 'James-Webb', 'Starlink-1042', 'Sentinel-6'];
const EVENT_TEMPLATES = [
  'Radar detected an approaching object in sector {sector}.',
  'Satellite {satellite} signal successfully updated.',
  'Class {class} solar flare detected. Transmission may contain interference.',
  'Orbit correction for {satellite} completed. No deviations.',
  'Space debris detected at a distance of {dist} km from {satellite}.'
];

const satellitesState = {
  'ISS': { lat: 25.4, lng: -40.2, alt: 420 },
  'Hubble': { lat: -12.1, lng: 110.5, alt: 535 },
  'James-Webb': { lat: 1.5, lng: 30.1, alt: 1500000 }
};

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateSpaceNotification() {
  const sat = getRandomItem(SPACE_SATELLITES);
  const sector = `${Math.floor(Math.random() * 90 + 10)}-${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`;
  const template = getRandomItem(EVENT_TEMPLATES);

  const message = template
    .replace('{satellite}', sat)
    .replace('{sector}', sector)
    .replace('{class}', getRandomItem(['M1.2', 'X2.5', 'C8.1']))
    .replace('{dist}', (Math.random() * 500 + 10).toFixed(1));

  return {
    type: 'NOTIFICATION',
    timestamp: new Date().toISOString(),
    data: {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      severity: getRandomItem(['info', 'warning', 'critical']),
      message
    }
  };
}

function generateSatellitesTelemetry() {
  const updatedSatellites = Object.keys(satellitesState).map((satId) => {
    const sat = satellitesState[satId];
    sat.lat += (Math.random() - 0.5) * 0.5;
    sat.lng += (Math.random() - 0.5) * 0.5;

    if (sat.lat > 90) sat.lat = -90;
    if (sat.lat < -90) sat.lat = 90;
    if (sat.lng > 180) sat.lng = -180;
    if (sat.lng < -180) sat.lng = 180;

    return {
      id: satId,
      latitude: parseFloat(sat.lat.toFixed(4)),
      longitude: parseFloat(sat.lng.toFixed(4)),
      altitudeKm: sat.alt,
      velocityKmS: parseFloat((7.5 + Math.random() * 0.2).toFixed(2))
    };
  });

  return {
    type: 'TELEMETRY_TRAJECTORY',
    timestamp: new Date().toISOString(),
    data: updatedSatellites
  };
}

// Main initialization function
function initWebSocketServer(server) {
  const wss = new WebSocketServer({ server });

  function broadcast(data) {
    const payload = JSON.stringify(data);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  // Broadcast timers
  setInterval(() => {
    if (wss.clients.size > 0) {
      broadcast(generateSatellitesTelemetry());
    }
  }, 3000);

  setInterval(() => {
    if (wss.clients.size > 0) {
      broadcast(generateSpaceNotification());
    }
  }, 5000);

  // Connection handling
  wss.on('connection', (ws) => {
    console.log('[WS] Client connected');

    ws.send(JSON.stringify({ type: 'SYSTEM', message: 'Connection to MCC established.' }));
    ws.send(JSON.stringify(generateSatellitesTelemetry()));

    ws.on('close', () => console.log('[WS] Client disconnected'));
  });

  return wss;
}

module.exports = initWebSocketServer;