import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass" style={{
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
      borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none'
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '0 24px',
        height: 72,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--gold), var(--gold-dim))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800, color: '#0E0E10',
            boxShadow: '0 4px 12px rgba(201,168,76,0.3)'
          }}>C</div>
          <span style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 22, fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em'
          }}>CarMatrix</span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[
            { to: '/', label: 'Home' },
            { to: '/cars', label: 'Browse Cars' },
            ...(user ? [{ to: '/bookings', label: 'My Bookings' }] : []),
            ...(user ? [{ to: '/profile', label: 'My Profile' }] : []),
            ...(user?.role === 'Admin' ? [{ to: '/admin', label: 'Admin' }] : []),
          ].map(link => (
            <Link key={link.to} to={link.to} style={{
              textDecoration: 'none',
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              color: isActive(link.to) ? 'var(--gold)' : 'var(--text-secondary)',
              background: isActive(link.to) ? 'rgba(201,168,76,0.08)' : 'transparent',
              transition: 'all 0.15s',
            }}>{link.label}</Link>
          ))}
        </div>

        {/* Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user ? (
            <>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Hi, <span style={{ color: 'var(--gold-light)' }}>{user.name?.split(' ')[0]}</span>
              </span>
              <button onClick={handleLogout} className="btn-ghost" style={{ padding: '7px 16px', fontSize: 13 }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="btn-ghost" style={{ padding: '7px 16px', fontSize: 13 }}>Login</button>
              </Link>
              <Link to="/register">
                <button className="btn-gold" style={{ padding: '7px 16px', fontSize: 13 }}>Register</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
