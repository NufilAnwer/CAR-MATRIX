import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { id: 'overview',    label: 'Overview',       icon: '▦' },
  { id: 'cars',        label: 'Cars',           icon: '🚗' },
  { id: 'bookings',    label: 'Bookings',       icon: '📋' },
  { id: 'customers',   label: 'Customers',      icon: '👤' },
  { id: 'drivers',     label: 'Drivers',        icon: '👨‍✈️' },
  { id: 'driver-apps', label: 'Applications',   icon: '📝' }, 
  { id: 'reports',     label: 'Revenue Report', icon: '📊' },
];

export default function AdminLayout({ activeTab, onTabChange, children }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-deep)' }}>
      {/* Sidebar */}
      <div style={{
        width: 260,
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        bottom: 0,
        zIndex: 100
      }}>
        <div style={{ padding: '32px 24px', borderBottom: '1px solid var(--border)' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--gold), var(--gold-dim))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#0E0E10' }}>C</div>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 600 }}>CarMatrix</span>
          </Link>
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>ADMIN PANEL</div>
        </div>

        <nav style={{ flex: 1, padding: '24px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10,
                border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: 14, fontWeight: 500,
                background: activeTab === item.id ? 'rgba(201,168,76,0.1)' : 'transparent',
                color: activeTab === item.id ? 'var(--gold)' : 'var(--text-secondary)',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: 20, borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '0 8px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👤</div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.name || 'Admin'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.role}</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            style={{ 
              width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border)', 
              background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: 260, padding: 40 }}>
        {children}
      </div>
    </div>
  );
}
