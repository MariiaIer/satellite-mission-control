// shell-host/src/components/AngularTrackerWrapper.jsx
import React, { useEffect, useRef } from 'react';

export default function AngularTrackerWrapper() {
  const containerRef = useRef(null);

  useEffect(() => {
    let appRef = null;

    // Load the mountTracker function from the 'angularTracker' remote
    import('angularTracker/TrackerMount')
      .then(({ mountTracker }) => {
        if (containerRef.current) {
          // Mount Angular into our DOM element
          mountTracker(containerRef.current).then((ref) => {
            appRef = ref;
          });
        }
      })
      .catch((err) => {
        console.error('Failed to load Angular MFE:', err);
      });

    // Memory cleanup on React component unmount
    return () => {
      if (appRef) {
        appRef.destroy();
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={containerRef} className="angular-tracker-container" />;
}