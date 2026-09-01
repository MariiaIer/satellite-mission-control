// src/component/TelemetryRow.jsx
import React from 'react';

function TelemetryRow({ row, columns }) {
  const renderCellContent = (key) => {
    switch (key) {
      case 'metric':
        return <span className="metric-title">{row.metric}</span>;
      case 'currentValue':
        return <code className="value-badge">{row.currentValue}</code>;
      case 'status':
        return (
          <div className={`status-badge status-${row.status.color}`}>
            <span className="status-dot"></span>
            {row.status.label}
          </div>
        );
      case 'normalRange':
        return <span className="range-text">{row.normalRange}</span>;
      default:
        return row[key];
    }
  };

  return (
    <tr>
      {columns.map((col) => (
        <td key={col.key}>{renderCellContent(col.key)}</td>
      ))}
    </tr>
  );
}

// Optimization: row re-renders only when props change
export default React.memo(TelemetryRow);