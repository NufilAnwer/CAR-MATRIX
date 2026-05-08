import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/users/me');
      setProfile(data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: '', text: '' });
    try {
      await api.put('/users/me', {
        name: profile.name,
        phone: profile.phone,
        driving_license_number: profile.driving_license_number,
        license_upload_path: profile.license_upload_path
      });
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <Navbar />
      <div style={{ padding: 80, textAlign: 'center' }} className="skeleton-text">Loading profile...</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <Navbar />
      
      <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, marginBottom: 8, fontFamily: 'Outfit, sans-serif' }}>My Profile</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your personal information and driving documents</p>
        </div>

        {message.text && (
          <div style={{ 
            padding: '12px 20px', borderRadius: 12, marginBottom: 24,
            background: message.type === 'success' ? 'rgba(52,199,89,0.1)' : 'rgba(255,59,48,0.1)',
            color: message.type === 'success' ? '#34C759' : '#FF3B30',
            border: `1px solid ${message.type === 'success' ? 'rgba(52,199,89,0.2)' : 'rgba(255,59,48,0.2)'}`,
            fontSize: 14
          }}>
            {message.text}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Account Details */}
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 18, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>Personal Information</h3>
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Full Name</label>
                <input 
                  className="input-base" 
                  value={profile.name} 
                  onChange={e => setProfile({...profile, name: e.target.value})}
                  required 
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Email Address</label>
                <input className="input-base" value={profile.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Phone Number</label>
                <input 
                  className="input-base" 
                  value={profile.phone} 
                  onChange={e => setProfile({...profile, phone: e.target.value})}
                  required 
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>CNIC Number</label>
                <input className="input-base" value={profile.cnic} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              </div>
              <button type="submit" className="btn-gold" style={{ marginTop: 8, padding: '12px' }} disabled={updating}>
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Documents */}
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 18, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>Driving Documents</h3>
            {profile.role === 'Customer' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>License Number</label>
                  <input 
                    className="input-base" 
                    placeholder="Enter License Number"
                    value={profile.driving_license_number || ''} 
                    onChange={e => setProfile({...profile, driving_license_number: e.target.value})}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Upload License Scan</label>
                  <div style={{ 
                    border: '2px dashed var(--border)', borderRadius: 12, padding: 32, textAlign: 'center',
                    background: 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'var(--transition)'
                  }}
                  onMouseOver={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>Click to upload or drag & drop</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>PNG, JPG or PDF up to 5MB</div>
                  </div>
                  {profile.license_upload_path && (
                    <div style={{ marginTop: 12, fontSize: 13, color: '#34C759', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>✓ Document uploaded</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                Admin accounts do not require driving licenses.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
