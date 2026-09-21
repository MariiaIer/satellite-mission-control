// shell-host/src/components/AngularTrackerWrapper.jsx
import React, { useEffect, useRef, useState } from 'react';

export default function AngularTrackerWrapper({ token }) {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadAngularMFE = async () => {
      try {
        const res = await fetch('http://localhost:5004/remoteEntry.json');
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        const manifest = await res.json();

        const imports = {};
        manifest.shared?.forEach((pkg) => {
          imports[pkg.packageName] = `http://localhost:5004/${pkg.outFileName}`;
        });

        if (manifest.chunks) {
          Object.values(manifest.chunks).flat().forEach((chunkFile) => {
            const chunkName = chunkFile.replace('.js', '');
            imports[`@nf-internal/${chunkName}`] = `http://localhost:5004/${chunkFile}`;
          });
        }

        if (!document.getElementById('native-federation-importmap')) {
          const mapScript = document.createElement('script');
          mapScript.id = 'native-federation-importmap';
          mapScript.type = 'importmap';
          mapScript.textContent = JSON.stringify({ imports });
          document.head.appendChild(mapScript);
        }

        const fileName = manifest.exposes?.[0]?.outFileName || 'TrackerMount.js';
        const entryUrl = `http://localhost:5004/${fileName}`;

        const remoteModule = await import(/* webpackIgnore: true */ entryUrl);

        if (isMounted && containerRef.current) {
          const mountFn = remoteModule.mount || remoteModule.default?.mount;
          if (typeof mountFn === 'function') {
            await mountFn(containerRef.current, { token });
          } else {
            containerRef.current.innerHTML = `<angular-tracker-element token="${token || ''}"></angular-tracker-element>`;
          }
        }
      } catch (err) {
        console.error('Angular MFE Load Error:', err);
        if (isMounted) setError(err.message);
      }
    };

    loadAngularMFE();

    // Clean up DOM and remove orphan custom elements on unmount
    return () => {
      isMounted = false;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      const orphanElements = document.querySelectorAll('angular-tracker-element');
      orphanElements.forEach((el) => el.remove());
    };
  }, []);

  if (error) {
    return <div style={{ color: 'red', padding: '10px' }}>Angular MFE Load Error: {error}</div>;
  }

  return <div ref={containerRef} id="angular-tracker-container" style={{ width: '100%', minHeight: '500px' }} />;
}