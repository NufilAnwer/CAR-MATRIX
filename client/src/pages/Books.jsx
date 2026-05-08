import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Book() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const car = state?.car;
  const [dates, setDates] = useState({
    start: state?.filters?.start || new Date().toISOString().split('T')[0],
    end: state?.filters?.end || new Date(Date.now() + 86400000).toISOString().split('T')[0],
  });
  const [drivers, setDrivers] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const totalDays = Math.max(1, Math.ceil((new Date(dates.end) - new Date(dates.start)) / 86400000));
  const basePrice = car ? car.price_per_day * totalDays : 0;
  const driverCost = selectedDriver ? selectedDriver.charge_per_day * totalDays : 0;
  const servicesCost = selectedServices.reduce((sum, s) => {
    return sum + (s.service_cost_type === 'PerDay' ? s.service_cost * totalDays : s.service_cost);
  }, 0);
  const total = basePrice + driverCost + servicesCost;

  useEffect(() => {
    api.get('/drivers/available').then(r => setDrivers(r.data)).catch(() => {});
    api.get('/services').then(r => setServices(r.data)).catch(() => {});
  }, []);

  const toggleService = (svc) => {
    setSelectedServices(prev =>
      prev.find(s => s.service_id === svc.service_id)
        ? prev.filter(s => s.service_id !== svc.service_id)
        : [...prev, svc]
    );
  };

  const handleBook = async () => {
    if (!user) return navigate('/login');
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/bookings', {
        car_id: id || car?.car_id,
        driver_id: selectedDriver?.driver_id || null,
        start_date: dates.start,
        end_date: dates.end,
        service_ids: selectedServices.map(s => s.service_id).join(','),
      });
      setSuccess(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally { setLoading(false); }
  };

  if (!car) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: 80 }}>
        <p style={{ color: 'var(--text-secondary)' }}>Car not found. <button onClick={() => navigate('/cars')} style={{ color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer' }}>Browse cars</button></p>
      </div>
    </div>
  );

  if (success) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <Navbar />
      <div style={{ maxWidth: 520, margin: '80px auto', padding: '0 24px', textAlign: 'center' }} className="fade-up">
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(52,199,89,0.12)', border: '1px solid rgba(52,199,89,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 32 }}>✓</div>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>Booking Confirmed!</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Your trip has been successfully booked.</p>

        <div className="card" style={{ padding: 24, textAlign: 'left', marginBottom: 24 }}>
          {[
            ['Booking ID', `#${success.booking_id}`],
            ['Car', `${car.brand} ${car.model}`],
            ['Dates', `${dates.start} → ${dates.end}`],
            ['Total Days', totalDays],
            ['Total Amount', `Rs. ${Number(success.total_amount).toLocaleString()}`],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{k}</span>
              <span style={{ fontWeight: 500, color: k === 'Total Amount' ? 'var(--gold)' : 'var(--text-primary)', fontSize: 13 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" style={{ flex: 1 }} onClick={() => navigate('/bookings')}>My Bookings</button>
          <button className="btn-gold" style={{ flex: 1 }} onClick={() => navigate('/cars')}>Book Another</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        <button onClick={() => navigate('/cars')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28 }}>
          ← Back to cars
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28, alignItems: 'start' }}>
          {/* Left — booking form */}
          <div className="fade-up">
            <h1 style={{ fontSize: 26, marginBottom: 4 }}>Complete your booking</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>{car.brand} {car.model} · {car.year}</p>

            {error && (
              <div style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.2)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#FF3B30', fontSize: 13 }}>
                {error}
              </div>
            )}

            {/* Dates */}
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
             <h3 style={{ 
                         fontSize: 11, fontWeight: 600, marginBottom: 16, fontFamily: 'DM Sans, sans-serif', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' 
}}>
  Rental Period
</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[['start', 'Pickup date'], ['end', 'Return date']].map(([k, lbl]) => (
                  <div key={k}>
                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>{lbl}</label>
                    <input className="input-base" type="date" value={dates[k]} onChange={e => setDates(d => ({ ...d, [k]: e.target.value }))} style={{ fontSize: 13 }} />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Duration</span>
                <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{totalDays} day{totalDays !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Driver */}
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <h3 style={{ fontSize: 11, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Driver (Optional)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 8, border: `1px solid ${!selectedDriver ? 'var(--gold-dim)' : 'var(--border)'}`, background: !selectedDriver ? 'rgba(201,168,76,0.05)' : 'transparent', cursor: 'pointer', transition: 'all 0.15s' }}>
                  <input type="radio" checked={!selectedDriver} onChange={() => setSelectedDriver(null)} style={{ accentColor: 'var(--gold)' }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>Self drive</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No additional charge</div>
                  </div>
                </label>
                {drivers.map(d => (
                  <label key={d.driver_id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 8, border: `1px solid ${selectedDriver?.driver_id === d.driver_id ? 'var(--gold-dim)' : 'var(--border)'}`, background: selectedDriver?.driver_id === d.driver_id ? 'rgba(201,168,76,0.05)' : 'transparent', cursor: 'pointer', transition: 'all 0.15s' }}>
                    <input type="radio" checked={selectedDriver?.driver_id === d.driver_id} onChange={() => setSelectedDriver(d)} style={{ accentColor: 'var(--gold)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{d.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>★ {d.avg_rating || '4.8'} · License: {d.license_number}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gold)' }}>+Rs. {Number(d.charge_per_day).toLocaleString()}/day</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Extra services */}
            {services.length > 0 && (
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: 11, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Extra Services</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {services.map(s => {
                    const checked = selectedServices.find(x => x.service_id === s.service_id);
                    return (
                      <label key={s.service_id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', borderRadius: 8, border: `1px solid ${checked ? 'var(--gold-dim)' : 'var(--border)'}`, background: checked ? 'rgba(201,168,76,0.05)' : 'transparent', cursor: 'pointer', transition: 'all 0.15s' }}>
                        <input type="checkbox" checked={!!checked} onChange={() => toggleService(s)} style={{ accentColor: 'var(--gold)' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{s.service_name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            Rs. {Number(s.service_cost).toLocaleString()} {s.service_cost_type === 'PerDay' ? '/day' : 'fixed'}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right — price summary */}
          <div style={{ position: 'sticky', top: 90 }}>
            <div className="card" style={{ padding: 24 }}>
              {/* Car summary */}
              <div style={{ display: 'flex', gap: 14, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 72, height: 56, borderRadius: 8, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0, overflow: 'hidden' }}>
                  {car.image_url ? (
                    <img src={car.image_url} alt={car.model} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    '🚗'
                  )}
                </div>
                <div>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, fontWeight: 600 }}>{car.brand} {car.model}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{car.year} · {car.category_name}</div>
                </div>
              </div>

              {/* Price breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Rs. {Number(car.price_per_day).toLocaleString()} × {totalDays} days</span>
                  <span>Rs. {Number(basePrice).toLocaleString()}</span>
                </div>
                {driverCost > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Driver</span>
                    <span>Rs. {Number(driverCost).toLocaleString()}</span>
                  </div>
                )}
                {selectedServices.map(s => (
                  <div key={s.service_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{s.service_name}</span>
                    <span>Rs. {Number(s.service_cost_type === 'PerDay' ? s.service_cost * totalDays : s.service_cost).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderTop: '1px solid var(--border)', marginBottom: 20 }}>
                <span style={{ fontWeight: 600 }}>Total</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--gold)', fontFamily: 'Playfair Display, serif' }}>
                  Rs. {Number(total).toLocaleString()}
                </span>
              </div>

              {!user ? (
                <button className="btn-gold" style={{ width: '100%', padding: 14, fontSize: 14 }} onClick={() => navigate('/login')}>
                  Login to Book
                </button>
              ) : (
                <button className="btn-gold" style={{ width: '100%', padding: 14, fontSize: 14 }} onClick={handleBook} disabled={loading}>
                  {loading ? 'Confirming...' : 'Confirm Booking'}
                </button>
              )}

              <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
                Free cancellation up to 24hrs before pickup
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
