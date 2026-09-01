// src/component/SatelliteCard.jsx
import React from 'react';
import TelemetryRow from './TelemetryRow';

function SatelliteCard({ satData, columns, fetchedAt }) {
  const formattedTime = fetchedAt ? fetchedAt.toLocaleTimeString() : 'Загрузка...';

  return (
    <div className="satellite-block">
      <div className="telemetry-header">
        <h2>
          {satData.satelliteName} <span className="satellite-id">({satData.satelliteId})</span>
        </h2>
        <div className="timestamp">Обновлено: {formattedTime}</div>
      </div>

      <div className="table-wrapper">
        <table className="telemetry-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {satData.filteredMetrics.map((row) => (
              <TelemetryRow key={row.id} row={row} columns={columns} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default React.memo(SatelliteCard);