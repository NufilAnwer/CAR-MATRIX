import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { jsPDF } from 'jspdf';

const STATUS_STYLES = {
  Confirmed:  { bg: 'rgba(52,199,89,0.1)',  color: '#34C759', label: 'Confirmed' },
  Pending:    { bg: 'rgba(201,168,76,0.1)',  color: 'var(--gold)', label: 'Pending' },
  Completed:  { bg: 'rgba(90,90,100,0.2)',   color: 'var(--text-secondary)', label: 'Completed' },
  Cancelled:  { bg: 'rgba(255,59,48,0.1)',   color: '#FF3B30', label: 'Cancelled' },
};

export default function Bookings() {
  const { user: _user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [cancelling, setCancelling] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/bookings/my');
      setBookings(data);
    } catch { setBookings([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return;
    setCancelling(bookingId);
    try {
      await api.put(`/bookings/${bookingId}/cancel`);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not cancel booking');
    } finally { setCancelling(null); }
  };

  const filtered = tab === 'all' ? bookings : bookings.filter(b => b.booking_status?.toLowerCase() === tab);
  const tabs = [
    { id: 'all', label: 'All', count: bookings.length },
    { id: 'confirmed', label: 'Active', count: bookings.filter(b => b.booking_status === 'Confirmed').length },
    { id: 'completed', label: 'Completed', count: bookings.filter(b => b.booking_status === 'Completed').length },
    { id: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.booking_status === 'Cancelled').length },
  ];

  const generateReceipt = (b) => {
    const doc = new jsPDF();
    const days = Math.ceil((new Date(b.end_date) - new Date(b.start_date)) / 86400000);
    
    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(201, 168, 76); // Gold
    doc.text('CarMatrix Receipt', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Booking #${b.booking_id}`, 105, 28, { align: 'center' });

    // Status Badge
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Status: ${b.booking_status}`, 20, 45);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 45);

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 50, 190, 50);

    // Customer & Car Info
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Details', 20, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${_user?.name || b.customer_name}`, 20, 75);

    doc.setFont('helvetica', 'bold');
    doc.text('Car Details', 120, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(`Car: ${b.car_name || 'Car'}`, 120, 75);
    doc.text(`Dates: ${b.start_date} to ${b.end_date}`, 120, 83);
    doc.text(`Duration: ${days} day(s)`, 120, 91);
    if (b.driver_name) doc.text(`Driver: ${b.driver_name}`, 120, 99);

    // Divider
    doc.line(20, 110, 190, 110);

    // Payment Summary
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Summary', 20, 125);
    doc.setFont('helvetica', 'normal');
    doc.text(`Payment Method: ${b.payment_method || 'Pending'}`, 20, 135);
    doc.text(`Payment Status: ${b.payment_status || 'Pending'}`, 20, 143);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Total Amount:', 120, 135);
    doc.setTextColor(201, 168, 76);
    doc.text(`Rs. ${Number(b.total_amount).toLocaleString()}`, 160, 135);

    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for choosing CarMatrix!', 105, 280, { align: 'center' });

    doc.save(`Receipt_CarMatrix_${b.booking_id}.pdf`);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <Navbar />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, marginBottom: 4 }}>My Bookings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Manage all your car rental trips
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                padding: '10px 18px', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                color: tab === t.id ? 'var(--gold)' : 'var(--text-secondary)',
                border: 'none', borderBottom: `2px solid ${tab === t.id ? 'var(--gold)' : 'transparent'}`,
                transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6,
              }}>
              {t.label}
              {t.count > 0 && (
                <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 10, background: tab === t.id ? 'rgba(201,168,76,0.15)' : 'var(--bg-elevated)', color: tab === t.id ? 'var(--gold)' : 'var(--text-muted)' }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bookings list */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3].map(i => (
              <div key={i} className="card" style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                {[1,2,3].map(j => <div key={j} className="skeleton" style={{ height: 18 }} />)}
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>No bookings yet</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Start by browsing our available cars</p>
            <button className="btn-gold" onClick={() => navigate('/cars')}>Browse Cars</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} className="fade-up">
            {filtered.map(b => {
              const st = STATUS_STYLES[b.booking_status] || STATUS_STYLES.Pending;
              const canCancel = ['Confirmed', 'Pending'].includes(b.booking_status);
              const days = Math.ceil((new Date(b.end_date) - new Date(b.start_date)) / 86400000);
              return (
                <div key={b.booking_id} className="card" style={{ padding: '20px 24px', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    {/* Left info */}
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🚗</div>
                      <div>
                        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 600, marginBottom: 3 }}>
                          {b.car_name || 'Car'}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          <span>📅 {b.start_date} → {b.end_date}</span>
                          <span>🕐 {days} day{days !== 1 ? 's' : ''}</span>
                          {b.driver_name && <span>👤 Driver: {b.driver_name}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Right — status + amount */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, letterSpacing: '0.04em', textTransform: 'uppercase', background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                      <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--gold)', fontFamily: 'Playfair Display, serif' }}>
                        Rs. {Number(b.total_amount).toLocaleString()}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Booking #{b.booking_id}
                      </div>
                    </div>
                  </div>

                  {/* Payment status + actions */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                      <span>Payment: <span style={{ color: b.payment_status === 'Completed' ? '#34C759' : 'var(--gold)' }}>{b.payment_status || 'Pending'}</span></span>
                      <span>{b.payment_method || '—'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {b.booking_status === 'Completed' && (
                        <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => navigate(`/review/${b.car_id}`)}>
                          Leave Review
                        </button>
                      )}
                      {(b.booking_status === 'Completed' || b.booking_status === 'Confirmed') && (
                        <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => generateReceipt(b)}>
                          Download Receipt
                        </button>
                      )}
                      {canCancel && (
                        <button
                          onClick={() => handleCancel(b.booking_id)}
                          disabled={cancelling === b.booking_id}
                          style={{ padding: '6px 14px', fontSize: 12, borderRadius: 8, border: '1px solid rgba(255,59,48,0.2)', background: 'rgba(255,59,48,0.06)', color: '#FF3B30', cursor: 'pointer', fontWeight: 500, transition: 'all 0.15s' }}>
                          {cancelling === b.booking_id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
