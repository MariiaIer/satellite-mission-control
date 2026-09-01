import React, { useEffect, useRef } from 'react';
import { importRemote } from '@module-federation/utilities';

export default function AngularTrackerWrapper() {
  const containerRef = useRef(null);

  useEffect(() => {
    let appRef = null;
    let isMounted = true;

    const mountMFE = async () => {
      try {

        const container = await importRemote({
          remoteEntryUrl: 'http://localhost:5004/remoteEntry.js',
          remoteName: 'angularTracker',
          exposedModule: './TrackerMount',
        });

        const mount = container.mountTracker || container.default?.mountTracker || container.default;

        if (typeof mount === 'function' && containerRef.current && isMounted) {
          appRef = await mount(containerRef.current);
        } else {
          console.error('Функция mountTracker не найдена в контейнере:', container);
        }
      } catch (err) {
        console.error('Ошибка при динамической загрузке Angular MFE:', err);
      }
    };

    mountMFE();

    return () => {
      isMounted = false;
      if (appRef && typeof appRef.destroy === 'function') {
        appRef.destroy();
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="angular-tracker-container"
      style={{ width: '100%', height: '100%', minHeight: '500px' }}
    />
  );
}