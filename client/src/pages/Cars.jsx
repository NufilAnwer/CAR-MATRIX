import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const CATEGORIES = [
  { id: '', label: 'All' }, { id: 1, label: 'Sedan' }, { id: 2, label: 'SUV' },
  { id: 3, label: 'Hatchback' }, { id: 4, label: 'Van' }, { id: 5, label: 'Luxury' },
];

function CarCard({ car, onBook }) {
  const isAvailable = car.is_available === 1;
  const statusLabel = isAvailable ? 'Available' : 'Already Booked';
  const statusClass = isAvailable ? 'badge-available' : 'badge-booked';

  return (
    <div className="card" style={{
      overflow: 'hidden', transition: 'all 0.2s ease',
      cursor: 'pointer',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Car image placeholder */}
      <div style={{
        height: 180, background: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-subtle))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderBottom: '1px solid var(--border)', position: 'relative',
      }}>
        {car.image_url ? (
          <img src={car.image_url} alt={car.model} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 56 }}>🚗</span>
        )}
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <span className={`badge ${statusClass}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Car details */}
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div>
            <h3 style={{ fontSize: 17, fontFamily: 'Playfair Display, serif', marginBottom: 2 }}>
              {car.brand} {car.model}
            </h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{car.year} · {car.category_name}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gold)' }}>
              Rs. {Number(car.price_per_day).toLocaleString()}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>per day</div>
          </div>
        </div>

        {/* Specs row */}
        <div style={{ display: 'flex', gap: 16, margin: '14px 0', flexWrap: 'wrap' }}>
          {[
            ['⚙', car.transmission_type],
            ['⛽', car.fuel_type],
            ['👥', `${car.seating_capacity} seats`],
          ].map(([icon, val]) => (
            <div key={val} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: 13 }}>{icon}</span> {val}
            </div>
          ))}
        </div>

        {/* Rating */}
        {car.avg_rating > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
            {[1,2,3,4,5].map(s => (
              <span key={s} style={{ fontSize: 12, color: s <= Math.round(car.avg_rating) ? 'var(--gold)' : 'var(--text-muted)' }}>★</span>
            ))}
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>
              {Number(car.avg_rating).toFixed(1)}
            </span>
          </div>
        )}

        <button
          className={isAvailable ? "btn-gold" : "btn-ghost"}
          style={{ width: '100%', padding: '11px', fontSize: 13, cursor: isAvailable ? 'pointer' : 'not-allowed', opacity: isAvailable ? 1 : 0.7 }}
          onClick={() => isAvailable && onBook(car)}
        >
          {isAvailable ? 'Book Now' : 'Already Booked · See Dates'}
        </button>
      </div>
    </div>
  );
}

export default function Cars() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [filters, setFilters] = useState({
    start: today, end: tomorrow,
    category: '', transmission: '', fuel: '', 
    minPrice: '', maxPrice: '', minSeats: '',
  });
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    search();
  }, []); // Initial load shows all available/booked cars

  const setF = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const search = async () => {
    setLoading(true); setSearched(true);
    try {
      const cleanParams = {};
      Object.keys(filters).forEach(k => {
        if (filters[k]) cleanParams[k] = filters[k];
      });
      const { data } = await api.get('/cars/search', { params: cleanParams });
      setCars(data);
    } catch { setCars([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { search(); }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <Navbar />

      {/* Hero search bar */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '32px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontSize: 28, marginBottom: 6 }}>Browse our fleet</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
            {cars.length > 0 ? `${cars.length} cars available for your dates` : 'Search available cars for your trip'}
          </p>

          {/* Search form */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 12, alignItems: 'end',
          }}>
            {[
              { key: 'start', label: 'Pickup date', type: 'date' },
              { key: 'end', label: 'Return date', type: 'date' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>{f.label}</label>
                <input className="input-base" type={f.type} value={filters[f.key]} onChange={e => setF(f.key, e.target.value)} style={{ fontSize: 13 }} />
              </div>
            ))}

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Category</label>
              <select className="input-base" value={filters.category} onChange={e => setF('category', e.target.value)} style={{ fontSize: 13 }}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Transmission</label>
              <select className="input-base" value={filters.transmission} onChange={e => setF('transmission', e.target.value)} style={{ fontSize: 13 }}>
                <option value="">Any</option>
                <option>Manual</option>
                <option>Automatic</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Fuel Type</label>
              <select className="input-base" value={filters.fuel} onChange={e => setF('fuel', e.target.value)} style={{ fontSize: 13 }}>
                <option value="">Any</option>
                <option>Petrol</option>
                <option>Diesel</option>
                <option>Electric</option>
                <option>Hybrid</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Min Price</label>
              <input className="input-base" type="number" placeholder="Min" value={filters.minPrice} onChange={e => setF('minPrice', e.target.value)} style={{ fontSize: 13, width: 80 }} />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Max Price</label>
              <input className="input-base" type="number" placeholder="Max" value={filters.maxPrice} onChange={e => setF('maxPrice', e.target.value)} style={{ fontSize: 13, width: 80 }} />
            </div>

            <button onClick={search} className="btn-gold" style={{ padding: '12px 24px', fontSize: 14, height: 46 }}>
              Search
            </button>
          </div>

          {/* Category pills */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => { setF('category', c.id); setTimeout(search, 50); }}
                style={{
                  padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  border: `1px solid ${filters.category == c.id ? 'var(--gold-dim)' : 'var(--border)'}`,
                  background: filters.category == c.id ? 'rgba(201,168,76,0.1)' : 'transparent',
                  color: filters.category == c.id ? 'var(--gold)' : 'var(--text-secondary)',
                  transition: 'all 0.15s',
                }}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="card" style={{ overflow: 'hidden' }}>
                <div className="skeleton" style={{ height: 180 }} />
                <div style={{ padding: 20 }}>
                  <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 10 }} />
                  <div className="skeleton" style={{ height: 14, width: '80%', marginBottom: 16 }} />
                  <div className="skeleton" style={{ height: 38 }} />
                </div>
              </div>
            ))}
          </div>
        ) : cars.length === 0 && searched ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontSize: 20, marginBottom: 8 }}>No cars found</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Try different dates or remove some filters</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}
            className="fade-up">
            {cars.map(car => (
              <CarCard 
                key={car.car_id} 
                car={car} 
                onBook={car.is_available ? () => navigate(`/book/${car.car_id}`, { state: { car, filters } }) : null} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
