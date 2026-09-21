import Header from './Header';
import Sidebar from './Sidebar';
import '../styles/global.css';

export default function MainLayout({ children, onLogout }) {
  return (
    <div className="layout-grid">
      <Header onLogout={onLogout} />
      <Sidebar />
      <main style={{ gridArea: 'content', padding: '20px' }}>
        {children}
      </main>
    </div>
  );
}