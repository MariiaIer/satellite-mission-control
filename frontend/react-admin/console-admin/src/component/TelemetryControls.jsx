// src/component/TelemetryControls.jsx
import React from 'react';

function TelemetryControls({
  satellitesList,
  selectedSatId,
  onSatelliteChange,
  selectedMetricName,
  onMetricChange,
  availableMetricNames,
  selectedStatus,
  onStatusChange,
  onRefresh,
  loading,
}) {
  const isAllSelected = selectedSatId === 'all';

  return (
    <div className="telemetry-controls" style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'center' }}>
      {/* Satellite Selector */}
      <div>
        <label style={{ marginRight: '8px', fontWeight: 'bold' }}>Satellite:</label>
        <select value={selectedSatId} onChange={onSatelliteChange}>
          <option value="all">All satellites ({satellitesList.length})</option>
          {satellitesList.map((sat) => (
            <option key={sat.id} value={sat.id}>
              {sat.name} ({sat.id})
            </option>
          ))}
        </select>
      </div>

      {/* Displayed only in 'all' mode */}
      {isAllSelected && (
        <>
          <div>
            <label style={{ marginRight: '8px', fontWeight: 'bold' }}>Sensor / Metric:</label>
            <select value={selectedMetricName} onChange={(e) => onMetricChange(e.target.value)}>
              <option value="all">All metrics</option>
              {availableMetricNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ marginRight: '8px', fontWeight: 'bold' }}>Status:</label>
            <select value={selectedStatus} onChange={(e) => onStatusChange(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="green">Nominal / Normal (Green)</option>
              <option value="yellow">Warning / High (Yellow)</option>
              <option value="red">Critical / Low (Red)</option>
            </select>
          </div>
        </>
      )}

      <button onClick={() => onRefresh(true)} disabled={loading}>
        {loading ? 'Loading...' : 'Force Refresh'}
      </button>
    </div>
  );
}

export default React.memo(TelemetryControls);