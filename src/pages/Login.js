import React, { useState } from 'react';
import { authAPI } from '../services/api';

const styleTag = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes gridMove {
    0% { transform: translateY(0); }
    100% { transform: translateY(40px); }
  }
  @keyframes glowPulse {
    0%, 100% { box-shadow: 0 0 40px rgba(0,255,136,0.15), 0 0 80px rgba(0,255,136,0.05); }
    50% { box-shadow: 0 0 60px rgba(0,255,136,0.25), 0 0 120px rgba(0,255,136,0.1); }
  }
  .login-card {
    animation: fadeIn 0.5s ease, glowPulse 3s ease infinite;
  }
  .login-input:focus {
    border-color: rgba(0,255,136,0.5) !important;
    background: rgba(0,255,136,0.04) !important;
    box-shadow: 0 0 0 3px rgba(0,255,136,0.08) !important;
    outline: none;
  }
  .login-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #00ff88, #00cc6a) !important;
    box-shadow: 0 0 30px rgba(0,255,136,0.4) !important;
    transform: translateY(-1px);
  }
  .login-btn:disabled {
    opacity: 0.5;
  }
  .grid-bg {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(0,255,136,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,136,0.04) 1px, transparent 1px);
    background-size: 40px 40px;
    animation: gridMove 4s linear infinite;
  }
`;

const s = {
  page: {
    minHeight: '100vh',
    background: '#020c0a',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px', position: 'relative', overflow: 'hidden',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  glow1: {
    position: 'absolute', width: '400px', height: '400px',
    background: 'radial-gradient(circle, rgba(0,255,136,0.08) 0%, transparent 70%)',
    top: '-100px', left: '-100px', pointerEvents: 'none',
  },
  glow2: {
    position: 'absolute', width: '300px', height: '300px',
    background: 'radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 70%)',
    bottom: '-50px', right: '-50px', pointerEvents: 'none',
  },
  card: {
    background: '#071a14',
    border: '1px solid rgba(0,255,136,0.15)',
    borderRadius: '20px', padding: '44px 40px',
    width: '100%', maxWidth: '420px',
    position: 'relative', zIndex: 1,
  },
  logoWrap: {
    width: '56px', height: '56px',
    background: 'linear-gradient(135deg, #00ff88, #00e5ff)',
    borderRadius: '14px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 20px', fontSize: '24px',
    boxShadow: '0 0 24px rgba(0,255,136,0.4)',
  },
  title: {
    textAlign: 'center', fontSize: '26px', fontWeight: '800',
    color: '#e2ffe8', marginBottom: '4px',
    letterSpacing: '-0.01em',
  },
  titleAccent: { color: '#00ff88' },
  sub: {
    textAlign: 'center', color: '#5a8a6e',
    fontSize: '13px', marginBottom: '32px',
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: '0.05em',
  },
  label: {
    display: 'block', fontSize: '12px', fontWeight: '700',
    color: '#5a8a6e', marginBottom: '8px',
    letterSpacing: '0.08em', textTransform: 'uppercase',
    fontFamily: "'JetBrains Mono', monospace",
  },
  input: {
    width: '100%', padding: '13px 16px',
    background: 'rgba(0,255,136,0.03)',
    border: '1px solid rgba(0,255,136,0.12)',
    borderRadius: '10px', fontSize: '14px',
    color: '#e2ffe8', marginBottom: '18px',
    transition: 'all 0.2s',
  },
  btn: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(135deg, #00cc6a, #00aa55)',
    color: '#020c0a', border: 'none',
    borderRadius: '10px', fontSize: '15px', fontWeight: '800',
    cursor: 'pointer', letterSpacing: '0.03em',
    transition: 'all 0.2s',
    boxShadow: '0 0 20px rgba(0,255,136,0.2)',
  },
  error: {
    background: 'rgba(255,68,102,0.08)',
    border: '1px solid rgba(255,68,102,0.2)',
    color: '#ff4466', padding: '11px 16px',
    borderRadius: '8px', marginBottom: '20px',
    fontSize: '13px', textAlign: 'center',
  },
  divider: {
    margin: '28px 0 0',
    borderTop: '1px solid rgba(0,255,136,0.08)',
    paddingTop: '16px',
    textAlign: 'center',
    fontSize: '11px', color: '#2a5a3e',
    fontFamily: "'JetBrains Mono', monospace",
  },
};

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email || !password) { setError('Complete todos los campos'); return; }
    setLoading(true); setError('');
    try {
      const res = await authAPI.login(email, password);
      onLogin(res.data.user, res.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{styleTag}</style>
      <div style={s.page}>
        <div style={s.glow1}></div>
        <div style={s.glow2}></div>
        <div className="grid-bg"></div>

        <div style={s.card} className="login-card">
          <div style={s.logoWrap}>💵</div>
          <h1 style={s.title}>
            Gota <span style={s.titleAccent}>a</span> Gota
          </h1>
          <p style={s.sub}>// panel_de_oficina</p>

          {error && <div style={s.error}>{error}</div>}

          <label style={s.label}>Usuario</label>
          <input
            className="login-input"
            style={s.input}
            type="email"
            placeholder="admin@gotaagota.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />

          <label style={s.label}>Contraseña</label>
          <input
            className="login-input"
            style={s.input}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />

          <button
            className="login-btn"
            style={s.btn}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? '[ autenticando... ]' : 'Iniciar Sesion'}
          </button>

          <div style={s.divider}>sistema_seguro · v2.0 · gota_a_gota</div>
        </div>
      </div>
    </>
  );
}