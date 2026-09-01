// src/component/Dashboard.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { fetchWithAuth } from '../utils/api';

import TelemetryControls from './TelemetryControls';
import SatelliteCard from './SatelliteCard';
import './Dashboard.css';

export default function Dashboard() {
  const [satellitesList, setSatellitesList] = useState([]);
  const [selectedSatId, setSelectedSatId] = useState('sat-001');
  const [selectedMetricName, setSelectedMetricName] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [cache, setCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Загрузка списка всех спутников при старте
  useEffect(() => {
    async function loadSatellitesList() {
      try {
        const response = await fetchWithAuth('http://localhost:3000/api/metrics/v1/satellites');
        if (!response.ok) throw new Error(`Ошибка загрузки списка: ${response.status}`);
        const json = await response.json();
        if (json.success) setSatellitesList(json.data);
      } catch (err) {
        console.error('Не удалось загрузить список спутников:', err);
      }
    }
    loadSatellitesList();
  }, []);

  const handleSatelliteChange = useCallback((e) => {
    const newSatId = e.target.value;
    setSelectedSatId(newSatId);

    if (newSatId !== 'all') {
      setSelectedMetricName('all');
      setSelectedStatus('all');
    }
  }, []);

  const buildUrl = useCallback((satId) => {
    const queryParams = new URLSearchParams();
    if (satId === 'all') {
      queryParams.append('all', 'true');
    } else {
      queryParams.append('satelliteId', satId);
    }
    return `http://localhost:3000/api/metrics/v1?${queryParams.toString()}`;
  }, []);

  // 2. Загрузка данных телеметрии
  const loadMetrics = useCallback(async (forceRefresh = false) => {
    const url = buildUrl(selectedSatId);

    if (!forceRefresh && cache[url]) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchWithAuth(url);
      if (!response.ok) throw new Error(`Ошибка сервера: ${response.status}`);
      const json = await response.json();

      if (json.success) {
        setCache((prev) => ({
          ...prev,
          [url]: { payload: json, fetchedAt: new Date() }
        }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedSatId, buildUrl, cache]);

  useEffect(() => {
    loadMetrics(false);
  }, [selectedSatId, loadMetrics]);

  // Выборка из кэша
  const currentCacheEntry = cache[buildUrl(selectedSatId)];
  const currentRawData = currentCacheEntry?.payload;
  const fetchedAt = currentCacheEntry?.fetchedAt;

  // Динамический список имен метрик
  const availableMetricNames = useMemo(() => {
    if (!currentRawData?.data) return [];
    const satellites = Array.isArray(currentRawData.data) ? currentRawData.data : [currentRawData.data];
    const namesSet = new Set();

    satellites.forEach((sat) => sat.metrics?.forEach((m) => namesSet.add(m.metric)));
    return Array.from(namesSet);
  }, [currentRawData]);

  // Фильтрация списка на основе выбранных параметров
  const filteredSatellites = useMemo(() => {
    if (!currentRawData?.data) return [];
    const satellites = Array.isArray(currentRawData.data) ? currentRawData.data : [currentRawData.data];

    return satellites
      .map((sat) => {
        const matchingMetrics = sat.metrics.filter((m) => {
          const matchMetric = selectedMetricName === 'all' || m.metric === selectedMetricName;
          const matchStatus =
            selectedStatus === 'all' ||
            m.status.color.toLowerCase() === selectedStatus.toLowerCase() ||
            m.status.code.toLowerCase() === selectedStatus.toLowerCase();

          return matchMetric && matchStatus;
        });

        return { ...sat, filteredMetrics: matchingMetrics };
      })
      .filter((sat) => sat.filteredMetrics.length > 0);
  }, [currentRawData, selectedMetricName, selectedStatus]);

// Dynamic calculation of card height based on the number of filtered rows (45px per row + card header)
  const rowVirtualizer = useWindowVirtualizer({
    count: filteredSatellites.length,
    estimateSize: (index) => {
      const metricsCount = filteredSatellites[index]?.filteredMetrics?.length || 5;
      return 100 + metricsCount * 45;
    },
    overscan: 3
  });

  const columns = currentRawData?.columns || [];

  return (
    <div className="telemetry-container">
      <TelemetryControls
        satellitesList={satellitesList}
        selectedSatId={selectedSatId}
        onSatelliteChange={handleSatelliteChange}
        selectedMetricName={selectedMetricName}
        onMetricChange={setSelectedMetricName}
        availableMetricNames={availableMetricNames}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onRefresh={loadMetrics}
        loading={loading}
      />

      {error && <div className="telemetry-error">Ошибка: {error}</div>}
      {loading && !currentRawData && <div className="telemetry-loading">Loading telemetry...</div>}

      {currentRawData && (
        <div className="telemetry-list-wrapper" style={{ width: '100%' }}>
          {filteredSatellites.length > 0 ? (
            <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const satData = filteredSatellites[virtualRow.index];

                return (
                  <div
                    key={satData.satelliteId}
                    ref={rowVirtualizer.measureElement}
                    data-index={virtualRow.index}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                      paddingBottom: '20px'
                    }}
                  >
                    <SatelliteCard satData={satData} columns={columns} fetchedAt={fetchedAt} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px', color: '#8b949e' }}>
              No satellites found matching the selected filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
