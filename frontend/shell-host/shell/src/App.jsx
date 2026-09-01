import React, { useState, useEffect, Suspense } from 'react';

// Dynamic imports for microfrontends (Remote Module Federation)
const RemoteLoginForm = React.lazy(() => import('authApp/LoginForm'));
const RemoteAdminApp = React.lazy(() => import('adminApp/App'));
const RemoteMainLayout = React.lazy(() => import('sharedApp/MainLayout'));

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check session/token on application load
  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        // If the token is expired/invalid — clear it
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    } catch {
      // On network error, rely on the presence of the token in localStorage
      setIsAuthenticated(Boolean(localStorage.getItem('token')));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    const handleAuthChange = () => checkAuth();
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');

    try {
      if (token) {
        // 1. Notify the backend about logout (verify URL: /api/logout or /logout)
        await fetch('http://localhost:5000/api/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Server logout error:', error);
    } finally {
      // 2. Clear localStorage
      localStorage.removeItem('token');
      
      // 3. Update React state WITHOUT page reload
      setIsAuthenticated(false);

      // 4. Notify other microfrontends about auth state change
      window.dispatchEvent(new Event('auth-change'));
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading application...</div>;

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      {!isAuthenticated ? (
        /* 1. LOGIN FORM (authApp) */
        <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto' }}>
          <Suspense fallback={<div>Loading login form...</div>}>
            <RemoteLoginForm onSuccess={() => {
              setIsAuthenticated(true);
              window.dispatchEvent(new Event('auth-change'));
            }} />
          </Suspense>
        </div>
      ) : (
        /* 2. LAYOUT AND CONTENT (sharedApp + adminApp) */
        <Suspense fallback={<div>Loading interface...</div>}>
          <RemoteMainLayout>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
              <h2>Control Panel</h2>
              <button 
                onClick={handleLogout} 
                style={{ 
                  padding: '8px 16px', 
                  cursor: 'pointer',
                  backgroundColor: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px'
                }}
              >
                Logout
              </button>
            </div>

            <Suspense fallback={<div>Loading admin content...</div>}>
              <RemoteAdminApp />
            </Suspense>
          </RemoteMainLayout>
        </Suspense>
      )}
    </div>
  );
}

export default App;