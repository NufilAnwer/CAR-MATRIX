import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Home     from './pages/Home';
import Login    from './pages/Login';
import Register from './pages/Register';
import Cars     from './pages/Cars';
import Book     from './pages/Books';
import Bookings from './pages/Bookings';
import Admin from './pages/admin/Admin';
import DriverRegister  from './pages/DriverRegister';
import DriverDashboard from './pages/DriverDashboard';
import Profile         from './pages/Profile';

function PrivateRoute({ children, adminOnly = false }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'Admin') return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <Routes>
      <Route path="/"             element={<Home />} />
      <Route path="/login"        element={<Login />} />
      <Route path="/register"     element={<Register />} />
      <Route path="/cars"         element={<Cars />} />
      <Route path="/book/:id"     element={<Book />} />
      <Route path="/bookings"     element={<PrivateRoute><Bookings /></PrivateRoute>} />
      <Route path="/admin"        element={<PrivateRoute adminOnly={true}><Admin /></PrivateRoute>}/>
      <Route path="/driver/register" element={<DriverRegister />} />
      <Route path="/driver/dashboard" element={<PrivateRoute><DriverDashboard /></PrivateRoute>} />
      <Route path="/profile"      element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="*"             element={<Navigate to="/" replace />} />
      </Routes>

      {/* Floating Theme Toggle */}
      <button 
        onClick={toggleTheme} 
        style={{ 
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: 'var(--bg-elevated)', border: '1px solid var(--border)', 
          color: 'var(--text-primary)', width: 44, height: 44, borderRadius: '50%', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          cursor: 'pointer', transition: 'all 0.2s', fontSize: 20,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
        title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
