import React, { useEffect, useRef, useState } from 'react';

export default function AngularTrackerWrapper({ token }) {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const initAndMount = async () => {
      try {
        // 1. Fetch the remote manifest
        const res = await fetch('http://localhost:5004/remoteEntry.json');
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        const manifest = await res.json();

        // 2. Generate the browser Import Map
        const imports = {};

        // Map shared packages (@angular/core, rxjs, etc.)
        manifest.shared?.forEach((pkg) => {
          imports[pkg.packageName] = `http://localhost:5004/${pkg.outFileName}`;
        });

        // Map internal esbuild chunks (@nf-internal/chunk-...)
        if (manifest.chunks) {
          Object.values(manifest.chunks).flat().forEach((chunkFile) => {
            const chunkName = chunkFile.replace('.js', '');
            imports[`@nf-internal/${chunkName}`] = `http://localhost:5004/${chunkFile}`;
          });
        }

        // 3. Inject <script type="importmap"> into <head> if it doesn't exist yet
        if (!document.getElementById('native-federation-importmap')) {
          const mapScript = document.createElement('script');
          mapScript.id = 'native-federation-importmap';
          mapScript.type = 'importmap';
          mapScript.textContent = JSON.stringify({ imports });
          document.head.appendChild(mapScript);
        }

        // 4. Resolve the entry point file name
        const fileName = manifest.exposes?.[0]?.outFileName || 'TrackerMount.js';
        const entryUrl = `http://localhost:5004/${fileName}`;

        // 5. Dynamically import the module (the browser resolves paths via the Import Map)
        const remoteModule = await import(/* webpackIgnore: true */ entryUrl);

        if (isMounted && containerRef.current) {
          const mountFn = remoteModule.mount || remoteModule.default?.mount;
          if (mountFn) {
            await mountFn(containerRef.current, { token });
          } else {
            containerRef.current.innerHTML = `<angular-tracker-element token="${token || ''}"></angular-tracker-element>`;
          }
        }
      } catch (err) {
        console.error('MFR Error:', err);
        if (isMounted) setError(err.message);
      }
    };

    initAndMount();

    return () => {
      isMounted = false;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [token]);

  if (error) {
    return <div style={{ color: 'red', padding: '10px' }}>MFR Error: {error}</div>;
  }

  return <div ref={containerRef} id="angular-tracker-container" style={{ width: '100%', minHeight: '500px' }} />;
}