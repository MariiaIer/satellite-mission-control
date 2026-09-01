// controllers/telemetryController.js

const satelliteNames = [
  "Orbiter-Alpha", "Sentinel-V", "CosmoRay-3", "Astra-9", "LunarPro-1",
  "Solaris-X", "ApexSat-2", "Zenith-4", "TitanTrack-7", "Spectra-11",
  "Voyager-Lite", "Polaris-8", "GeoScout-5", "AquaSat-3", "Nebula-X1",
  "OrionScope-2", "Helios-6", "StarGazer-9", "Pioneer-X", "Chronos-12"
];

const generateSatellites = (count = 20) => {
  const statuses = [
    { code: "NORMAL", label: "Normal", color: "green" },
    { code: "NOMINAL", label: "Nominal", color: "green" },
    { code: "HIGH", label: "High", color: "yellow" },
    { code: "WARNING", label: "Warning", color: "red" },
    { code: "CRITICAL", label: "Critical", color: "red" }
  ];

  return Array.from({ length: count }, (_, index) => {
    const idNum = String(index + 1).padStart(3, '0');
    return {
      satelliteId: `sat-${idNum}`,
      satelliteName: satelliteNames[index] || `Satellite-${idNum}`,
      metrics: [
        {
          id: "m-01",
          metric: "Attitude (Pitch / Roll / Yaw)",
          currentValue: `${(Math.random() * 2).toFixed(2)}° / ${(Math.random() * -1).toFixed(2)}° / ${(Math.random() * 1.5).toFixed(2)}°`,
          status: statuses[index % statuses.length],
          normalRange: "±2.0°"
        },
        {
          id: "m-02",
          metric: "Hull Temperature (Sunside)",
          currentValue: `+${(90 + Math.random() * 50).toFixed(1)} °C`,
          status: statuses[(index + 1) % statuses.length],
          normalRange: "< +115.0 °C"
        },
        {
          id: "m-03",
          metric: "Cabin Pressure (Hab-1)",
          currentValue: `${(96 + Math.random() * 6).toFixed(1)} kPa`,
          status: statuses[(index + 2) % statuses.length],
          normalRange: "98 — 102 kPa"
        },
        {
          id: "m-04",
          metric: "Battery Charge (Solar Array A)",
          currentValue: `${(15 + Math.random() * 80).toFixed(1)} %`,
          status: statuses[(index + 3) % statuses.length],
          normalRange: "> 20 %"
        },
        {
          id: "m-05",
          metric: "Signal Latency (RTT)",
          currentValue: `${(0.8 + Math.random() * 2.5).toFixed(2)} sec`,
          status: statuses[(index + 4) % statuses.length],
          normalRange: "< 2.50 sec"
        }
      ]
    };
  });
};

// Replace array with generator call:
const satellitesMetricsData = generateSatellites(20);



/**
 * Get satellite telemetry and metrics
 * GET /api/metrics/v1
 * GET /api/metrics/v1?satelliteId=sat-002
 * GET /api/metrics/v1?all=true
 */
const getSatelliteMetrics = (req, res) => {
  try {
    const { satelliteId, all } = req.query;

    const columns = [
      { key: "metric", label: "Sensor / Metric" },
      { key: "currentValue", label: "Current Value" },
      { key: "status", label: "Status" },
      { key: "normalRange", label: "Normal Range" }
    ];

    // 1. Return all satellites (all=true)
    if (all === "true") {
      return res.status(200).json({
        success: true,
        columns,
        data: satellitesMetricsData
      });
    }

    // 2. Search for a specific satellite or default to the first one
    const targetSat = satelliteId
      ? satellitesMetricsData.find((s) => s.satelliteId === satelliteId)
      : satellitesMetricsData[0];

    if (!targetSat) {
      return res.status(404).json({
        success: false,
        message: `Satellite with ID '${satelliteId}' not found`
      });
    }

    return res.status(200).json({
      success: true,
      columns,
      data: targetSat
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching telemetry metrics",
      error: error.message
    });
  }
};


const getSatellitesList = (req, res) => {
  try {
    const list = satellitesMetricsData.map((s) => ({
      id: s.satelliteId,
      name: s.satelliteName
    }));

    return res.status(200).json({ success: true, data: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {
  getSatelliteMetrics,
  getSatellitesList
};