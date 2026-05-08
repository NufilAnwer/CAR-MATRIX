import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ position: 'relative', padding: '120px 24px 100px', textAlign: 'center', overflow: 'hidden' }}>
        {/* Car Animation Layer */}
        <div style={{ position: 'absolute', bottom: '20%', left: 0, width: '100%', pointerEvents: 'none', opacity: 0.4, zIndex: 0 }}>
          <div className="animate-drive" style={{ fontSize: 40 }}>🏎️</div>
        </div>

        {/* Background decoration */}
        <div style={{ position: 'absolute', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 850, margin: '0 auto', zIndex: 1 }} className="fade-up">
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px', 
            borderRadius: 30, border: '1px solid var(--border-gold)', 
            background: 'rgba(201,168,76,0.08)', marginBottom: 32, 
            fontSize: 11, fontWeight: 700, color: 'var(--gold)', 
            letterSpacing: '0.12em', textTransform: 'uppercase' 
          }}>
            Pakistan's #1 Luxury Car Network
          </div>

          <h1 style={{ fontSize: 'clamp(40px, 8vw, 72px)', lineHeight: 1.05, marginBottom: 24, letterSpacing: '-0.04em', fontWeight: 800 }}>
            Elevate your journey <br />
            <span style={{ 
              background: 'linear-gradient(to right, var(--gold), var(--gold-light))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>beyond luxury</span>
          </h1>
          <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--text-secondary)', maxWidth: 540, margin: '0 auto 48px', lineHeight: 1.8 }}>
            Experience unparalleled comfort and style. Rent the world's most prestigious vehicles with a single tap.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-gold" style={{ padding: '16px 44px', fontSize: 16, borderRadius: 12 }} onClick={() => navigate('/cars')}>
              Explore Fleet
            </button>
            <button className="btn-ghost" style={{ padding: '16px 36px', fontSize: 16, borderRadius: 12, backdropFilter: 'blur(10px)' }} onClick={() => navigate('/register')}>
              Join Member Club
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '32px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, textAlign: 'center' }}>
          {[['50+','Cars Available'], ['1,200+','Happy Customers'], ['4.9★','Average Rating'], ['24/7','Support']].map(([val, lbl]) => (
            <div key={lbl}>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--gold)', fontFamily: 'Playfair Display, serif', marginBottom: 4 }}>{val}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }} className="fade-up">
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 44px)', marginBottom: 16 }}>Why CarMatrix?</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>Setting the gold standard for car rentals in Pakistan</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
          {[
            { icon: '💎', title: 'Curated Fleet', desc: 'From S-Class to Land Cruisers, we offer only the finest vehicles in the country.' },
            { icon: '🛡️', title: 'Elite Security', desc: 'Premium insurance coverage and 24/7 roadside assistance for complete peace of mind.' },
            { icon: '🤵', title: 'Chauffeur Service', desc: 'Highly trained professional drivers available for a true VIP experience.' },
            { icon: '✨', title: 'Seamless Booking', desc: 'Modern technology that makes renting a car as easy as ordering a coffee.' },
          ].map((f, i) => (
            <div key={f.title} className="glass" style={{ padding: 40, borderRadius: 24, transition: 'var(--transition)', animationDelay: `${i * 0.1}s` }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ fontSize: 48, marginBottom: 24 }}>{f.icon}</div>
              <h3 style={{ fontSize: 20, marginBottom: 12 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ position: 'relative', margin: '0 24px 80px', padding: '100px 24px', borderRadius: 40, overflow: 'hidden', textAlign: 'center' }} className="glass">
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at top right, rgba(201,168,76,0.1), transparent)', pointerEvents: 'none' }} />
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', marginBottom: 20, position: 'relative' }}>Ready for your next elite journey?</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 40, fontSize: 16, maxWidth: 500, margin: '0 auto 40px', position: 'relative' }}>Join Pakistan's most exclusive car rental network today.</p>
        <button className="btn-gold" style={{ padding: '18px 56px', fontSize: 16, borderRadius: 14, position: 'relative' }} onClick={() => navigate('/cars')}>
          View Available Fleet
        </button>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
        © 2026 CarMatrix · FAST-NU Lahore · Database Systems Project
      </div>
    </div>
  );
}
