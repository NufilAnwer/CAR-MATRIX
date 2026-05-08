import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const STEPS = ['Account', 'Driver Info', 'Review'];

export default function DriverRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', cnic: '',
    password: '', confirm: '',
    license_number: '', charge_per_day: '',
    experience_years: '0', about_me: '',
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const nextStep = (e) => {
    e.preventDefault();
    setError('');
    if (step === 0) {
      if (form.password !== form.confirm) return setError('Passwords do not match');
      if (form.password.length < 6) return setError('Password must be at least 6 characters');
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/auth/driver-apply', form);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
      setStep(0);
    } finally { setLoading(false); }
  };

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }} className="fade-up">
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(201,168,76,0.1)', border: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 32 }}>
          ✓
        </div>
        <h1 style={{ fontSize: 28, marginBottom: 10 }}>Application Submitted!</h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 28, fontSize: 15 }}>
          Thank you, <span style={{ color: 'var(--gold-light)' }}>{form.full_name.split(' ')[0]}</span>! Your driver application is under review. We'll notify you at <strong>{form.email}</strong> once approved — usually within 24–48 hours.
        </p>
        <div className="card" style={{ padding: 20, textAlign: 'left', marginBottom: 24 }}>
          {[
            ['Name', form.full_name],
            ['Email', form.email],
            ['License', form.license_number],
            ['Daily rate', `Rs. ${Number(form.charge_per_day).toLocaleString()}`],
            ['Experience', `${form.experience_years} years`],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
              <span style={{ fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>
        <button className="btn-gold" onClick={() => navigate('/login')} style={{ width: '100%', padding: 13 }}>
          Go to Login
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', display: 'flex' }}>
      {/* Left panel */}
      <div style={{ width: 380, background: 'var(--bg-card)', borderRight: '1px solid var(--border)', padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 9, marginBottom: 48 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--gold), var(--gold-dim))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#0E0E10' }}>C</div>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 600 }}>CarMatrix</span>
          </Link>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 20, background: 'rgba(201,168,76,0.08)', border: '1px solid var(--border-gold)', marginBottom: 20 }}>
            <span style={{ fontSize: 14 }}>👨‍✈️</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gold)', letterSpacing: '0.04em' }}>Driver Registration</span>
          </div>

          <h2 style={{ fontSize: 26, lineHeight: 1.3, marginBottom: 20 }}>Join our driver network</h2>

          {[
            ['Earn on your schedule', 'Accept trips that fit your availability'],
            ['Transparent earnings', 'Know exactly what you earn per booking'],
            ['Verified & trusted', 'Carry pre-screened, genuine customers'],
            ['Quick approval', 'Applications reviewed within 24–48 hours'],
          ].map(([title, desc]) => (
            <div key={title} style={{ display: 'flex', gap: 11, marginBottom: 18 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(201,168,76,0.12)', border: '1px solid var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 3 }}>
                <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                  <path d="M1 3.5L3 5.5L8 1" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Sign in</Link>
          {' · '}
          <Link to="/register" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Customer register</Link>
        </p>
      </div>

      {/* Form panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '48px 64px' }}>
        <div style={{ width: '100%', maxWidth: 440 }} className="fade-up">

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 36 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 600, transition: 'all 0.3s',
                    background: step > i ? 'var(--gold)' : step === i ? 'linear-gradient(135deg,var(--gold),var(--gold-dim))' : 'var(--bg-elevated)',
                    color: step >= i ? '#0E0E10' : 'var(--text-muted)',
                    border: step < i ? '1px solid var(--border)' : 'none',
                  }}>
                    {step > i ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: 11, color: step === i ? 'var(--gold-light)' : 'var(--text-muted)', fontWeight: step === i ? 600 : 400, whiteSpace: 'nowrap' }}>{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ width: 60, height: 1, background: step > i ? 'var(--gold-dim)' : 'var(--border)', margin: '0 8px', marginBottom: 22, transition: 'all 0.3s' }} />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.2)', borderRadius: 8, padding: '11px 14px', marginBottom: 18, color: '#FF3B30', fontSize: 13 }}>
              {error}
            </div>
          )}

          {/* Step 0 — Account info */}
          {step === 0 && (
            <div className="fade-up">
              {/* Role Toggle Tabs (redirects to customer page if clicked) */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 28, background: 'var(--bg-elevated)', padding: 6, borderRadius: 12 }}>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                    background: 'transparent', color: 'var(--text-secondary)', border: 'none'
                  }}
                >
                  Rent a Car
                </button>
                <button
                  type="button"
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                    background: 'var(--bg-card)', color: 'var(--gold)', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}
                >
                  Drive for Us
                </button>
              </div>

              <form onSubmit={nextStep} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                <h2 style={{ fontSize: 22, marginBottom: 2 }}>Personal details</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 }}>Step 1 of 3 — Your account credentials</p>

              {[
                { k: 'full_name', label: 'Full name',      type: 'text',     ph: 'Usman Tariq' },
                { k: 'email',     label: 'Email address',  type: 'email',    ph: 'usman@email.com' },
                { k: 'phone',     label: 'Phone number',   type: 'tel',      ph: '03001234567' },
                { k: 'cnic',      label: 'CNIC number',    type: 'text',     ph: '35202-1234567-1' },
              ].map(f => (
                <div key={f.k}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 7 }}>{f.label}</label>
                  <input className="input-base" type={f.type} placeholder={f.ph} style={{ fontSize: 13 }} value={form[f.k]} onChange={e => set(f.k, e.target.value)} required />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 7 }}>Password</label>
                  <input className="input-base" type="password" placeholder="Min. 6 chars" style={{ fontSize: 13 }} value={form.password} onChange={e => set('password', e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 7 }}>Confirm</label>
                  <input className="input-base" type="password" placeholder="••••••" style={{ fontSize: 13 }} value={form.confirm} onChange={e => set('confirm', e.target.value)} required />
                </div>
              </div>
                <button type="submit" className="btn-gold" style={{ padding: 14, fontSize: 14, marginTop: 4 }}>Continue →</button>
              </form>
            </div>
          )}

          {/* Step 1 — Driver info */}
          {step === 1 && (
            <form onSubmit={nextStep} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <h2 style={{ fontSize: 22, marginBottom: 2 }}>Driver details</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 }}>Step 2 of 3 — Your driving credentials</p>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 7 }}>Driving License No.</label>
                <input className="input-base" type="text" placeholder="LHR-D-9876" style={{ fontSize: 13 }} value={form.license_number} onChange={e => set('license_number', e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 7 }}>Charge per day (Rs.)</label>
                  <input className="input-base" type="number" placeholder="800" min="100" style={{ fontSize: 13 }} value={form.charge_per_day} onChange={e => set('charge_per_day', e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 7 }}>Years of experience</label>
                  <input className="input-base" type="number" placeholder="3" min="0" max="50" style={{ fontSize: 13 }} value={form.experience_years} onChange={e => set('experience_years', e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 7 }}>About you (optional)</label>
                <textarea className="input-base" placeholder="Brief intro — routes you know, languages spoken, vehicle knowledge..." style={{ fontSize: 13, minHeight: 88, resize: 'vertical' }} value={form.about_me} onChange={e => set('about_me', e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" className="btn-ghost" style={{ flex: 1, padding: 13 }} onClick={() => setStep(0)}>← Back</button>
                <button type="submit" className="btn-gold" style={{ flex: 2, padding: 13, fontSize: 14 }}>Review Application →</button>
              </div>
            </form>
          )}

          {/* Step 2 — Review & submit */}
          {step === 2 && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 22, marginBottom: 2 }}>Review & submit</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 4 }}>Step 3 of 3 — Confirm your application details</p>

              <div className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Personal info</div>
                {[
                  ['Full name',   form.full_name],
                  ['Email',       form.email],
                  ['Phone',       form.phone],
                  ['CNIC',        form.cnic],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
                    <span style={{ fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>

              <div className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Driver info</div>
                {[
                  ['License no.',    form.license_number],
                  ['Daily rate',     `Rs. ${Number(form.charge_per_day || 0).toLocaleString()}`],
                  ['Experience',     `${form.experience_years} years`],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
                    <span style={{ fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
                {form.about_me && (
                  <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{form.about_me}</div>
                )}
              </div>

              <div style={{ padding: '12px 14px', borderRadius: 8, background: 'rgba(201,168,76,0.06)', border: '1px solid var(--border-gold)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                By submitting, you confirm all information is accurate. Your application will be reviewed by our admin team within 24–48 hours.
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn-ghost" style={{ flex: 1, padding: 13 }} onClick={() => setStep(1)}>← Edit</button>
                <button type="submit" className="btn-gold" style={{ flex: 2, padding: 13, fontSize: 14 }} disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
