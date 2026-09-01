import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside style={{ gridArea: 'sidebar', background: '#fff', borderRight: '1px solid #ddd', padding: '20px' }}>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <Link to="/admin/dashboard">Dashboard</Link>
        <Link to="/admin/users">Users</Link>
        <Link to="/tracker">Tracker (Angular)</Link>
      </nav>
    </aside>
  );
}