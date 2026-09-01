import Header from './Header';
import Sidebar from './Sidebar';
import '../styles/global.css';

export default function MainLayout({ children }) {
  return (
    <div className="layout-grid">
      <Header />
      <Sidebar />
      <main style={{ gridArea: 'content', padding: '20px' }}>
        {children}
      </main>
    </div>
  );
}