import { useState, useEffect } from 'react';
import api from '../../api/axios';

const EMPTY_CAR = { brand: '', model: '', year: new Date().getFullYear(), category_id: 1, transmission_type: 'Automatic', fuel_type: 'Petrol', price_per_day: '', seating_capacity: 5, description: '', image_url: '', driver_id: '' };
const STATUS_OPTIONS = ['Available', 'Under Maintenance', 'Reserved'];
const STATUS_COLORS  = { Available: '#34C759', Booked: 'var(--gold)', 'Under Maintenance': '#FF9500', Reserved: '#5856D6' };

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }}>
      <div 
  className="card fade-up" 
  style={{ width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto', padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <h2 style={{ fontSize: 18, fontFamily: 'Playfair Display, serif' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 7 }}>{label}</label>
      {children}
    </div>
  );
}

export default function CarsAdmin() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_CAR);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [drivers, setDrivers] = useState([]);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const fetchCars = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/cars');
      setCars(data);
    } catch { setCars([]); }
    finally { setLoading(false); }
  };

  const fetchDrivers = async () => {
    try {
      const { data } = await api.get('/admin/drivers');
      setDrivers(data);
    } catch { setDrivers([]); }
  };

  useEffect(() => { 
    fetchCars(); 
    fetchDrivers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (editingId) {
        await api.put(`/admin/cars/${editingId}`, form);
      } else {
        await api.post('/admin/cars', form);
      }
      setShowModal(false);
      setForm(EMPTY_CAR);
      setEditingId(null);
      fetchCars();
    } catch (err) {
      setError(err.response?.data?.message || (editingId ? 'Failed to update car' : 'Failed to add car'));
    } finally { setSaving(false); }
  };

  const handleEdit = (car) => {
    setForm({
      brand: car.brand,
      model: car.model,
      year: car.year,
      category_id: car.category_id,
      transmission_type: car.transmission_type,
      fuel_type: car.fuel_type,
      price_per_day: car.price_per_day,
      seating_capacity: car.seating_capacity,
      description: car.description || '',
      image_url: car.image_url || '',
      driver_id: car.driver_id || ''
    });
    setEditingId(car.car_id);
    setError('');
    setShowModal(true);
  };

  const handleStatusChange = async (carId, statusName) => {
    try {
      await api.patch(`/admin/cars/${carId}/status`, { status_name: statusName });
      fetchCars();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (carId) => {
    if (!window.confirm('Remove this car from the fleet?')) return;
    try {
      await api.delete(`/admin/cars/${carId}`);
      fetchCars();
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot delete — car has active bookings');
    }
  };

  const filtered = cars.filter(c =>
    `${c.brand} ${c.model}`.toLowerCase().includes(search.toLowerCase()) ||
    c.category_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '32px 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, marginBottom: 4 }}>Fleet Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{cars.length} cars in the system</p>
        </div>
        <button className="btn-gold" style={{ padding: '10px 22px', fontSize: 13 }} onClick={() => { setShowModal(true); setEditingId(null); setForm(EMPTY_CAR); setError(''); }}>
          + Add Car
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input className="input-base" style={{ maxWidth: 320, fontSize: 13 }} placeholder="Search by brand, model, category..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Cars table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                {['Car', 'Category', 'Driver', 'Price/day', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    {[1,2,3,4,5,6,7,8].map(j => (
                      <td key={j} style={{ padding: '14px 16px' }}><div className="skeleton" style={{ height: 14, width: j === 1 ? 120 : 60 }} /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  {search ? 'No cars match your search' : 'No cars added yet'}
                </td></tr>
              ) : filtered.map(car => (
                <tr key={car.car_id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{car.brand} {car.model}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{car.year}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{car.category_name}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13 }}>
                    {car.driver_name ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 14 }}>👨‍✈️</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{car.driver_name}</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Self-drive</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: 'var(--gold)' }}>Rs. {Number(car.price_per_day).toLocaleString()}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <select
                      value={car.status_name}
                      onChange={e => handleStatusChange(car.car_id, e.target.value)}
                      style={{
                        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                        borderRadius: 6, padding: '4px 8px', fontSize: 11, fontWeight: 600,
                        color: STATUS_COLORS[car.status_name] || 'var(--text-secondary)',
                        cursor: 'pointer', outline: 'none',
                      }}>
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      {car.status_name === 'Booked' && <option value="Booked" disabled>Booked</option>}
                    </select>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleEdit(car)}
                        style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 6, padding: '5px 12px', fontSize: 12, color: 'var(--gold)', cursor: 'pointer', fontWeight: 500 }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(car.car_id)}
                        style={{ background: 'rgba(255,59,48,0.06)', border: '1px solid rgba(255,59,48,0.2)', borderRadius: 6, padding: '5px 12px', fontSize: 12, color: '#FF3B30', cursor: 'pointer', fontWeight: 500 }}>
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Car Modal */}
      {showModal && (
        <Modal title={editingId ? "Update car" : "Add new car"} onClose={() => setShowModal(false)}>
          {error && <div style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#FF3B30', fontSize: 13 }}>{error}</div>}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Brand">
                <input className="input-base" style={{ fontSize: 13 }} placeholder="Toyota" value={form.brand} onChange={e => setF('brand', e.target.value)} required />
              </Field>
              <Field label="Model">
                <input className="input-base" style={{ fontSize: 13 }} placeholder="Corolla" value={form.model} onChange={e => setF('model', e.target.value)} required />
              </Field>
              <Field label="Year">
                <input className="input-base" style={{ fontSize: 13 }} type="number" min={2000} max={2030} value={form.year} onChange={e => setF('year', e.target.value)} required />
              </Field>
              <Field label="Price per day (Rs.)">
                <input className="input-base" style={{ fontSize: 13 }} type="number" placeholder="3500" value={form.price_per_day} onChange={e => setF('price_per_day', e.target.value)} required />
              </Field>
              <Field label="Category">
                <select className="input-base" style={{ fontSize: 13 }} value={form.category_id} onChange={e => setF('category_id', e.target.value)}>
                  {[['1','Sedan'],['2','SUV'],['3','Hatchback'],['4','Van'],['5','Luxury'],['6','Pickup Truck']].map(([id,n]) => <option key={id} value={id}>{n}</option>)}
                </select>
              </Field>
              <Field label="Seating capacity">
                <input className="input-base" style={{ fontSize: 13 }} type="number" min={2} max={15} value={form.seating_capacity} onChange={e => setF('seating_capacity', e.target.value)} required />
              </Field>
              <Field label="Transmission">
                <select className="input-base" style={{ fontSize: 13 }} value={form.transmission_type} onChange={e => setF('transmission_type', e.target.value)}>
                  <option>Automatic</option><option>Manual</option>
                </select>
              </Field>
              <Field label="Fuel type">
                <select className="input-base" style={{ fontSize: 13 }} value={form.fuel_type} onChange={e => setF('fuel_type', e.target.value)}>
                  <option>Petrol</option><option>Diesel</option><option>Electric</option><option>Hybrid</option>
                </select>
              </Field>
              <Field label="Assigned Driver">
                <select className="input-base" style={{ fontSize: 13 }} value={form.driver_id} onChange={e => setF('driver_id', e.target.value)}>
                  <option value="">No Driver (Self-Drive)</option>
                  {drivers.map(d => <option key={d.driver_id} value={d.driver_id}>{d.name} (Rs. {d.charge_per_day}/day)</option>)}
                </select>
              </Field>
            </div>
            <Field label="Image URL (optional)">
              <input className="input-base" style={{ fontSize: 13 }} placeholder="https://..." value={form.image_url} onChange={e => setF('image_url', e.target.value)} />
            </Field>
            <Field label="Description (optional)">
              <textarea className="input-base" style={{ fontSize: 13, minHeight: 72, resize: 'vertical' }} placeholder="Brief description of the car..." value={form.description} onChange={e => setF('description', e.target.value)} />
            </Field>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn-gold" style={{ flex: 2 }} disabled={saving}>{saving ? 'Saving...' : (editingId ? 'Update Car' : 'Add to Fleet')}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
