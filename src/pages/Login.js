import React, { useState } from 'react';
import { authAPI } from '../services/api';

const s = {
  page: { minHeight: '100vh', background: '#f5f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  card: { background: '#fff', borderRadius: '20px', padding: '48px 40px', width: '100%', maxWidth: '440px', boxShadow: '0 8px 40px rgba(0,0,0,0.1)' },
  logo: { width: '60px', height: '60px', background: '#16a34a', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '26px' },
  title: { textAlign: 'center', fontSize: '28px', fontWeight: '800', color: '#1a1a1a', marginBottom: '4px' },
  sub: { textAlign: 'center', color: '#64748b', fontSize: '15px', marginBottom: '36px' },
  label: { display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' },
  input: { width: '100%', padding: '14px 16px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '15px', marginBottom: '20px', outline: 'none', background: '#f9fafb' },
  btn: { width: '100%', padding: '15px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.5px' },
  error: { background: '#fef2f2', color: '#ef4444', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' },
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
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>💵</div>
        <h1 style={s.title}>Gota a Gota</h1>
        <p style={s.sub}>Panel de Oficina</p>
        {error && <div style={s.error}>{error}</div>}
        <label style={s.label}>Usuario</label>
        <input style={s.input} type="email" placeholder="admin@gotaagota.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        <label style={s.label}>Contraseña</label>
        <input style={s.input} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        <button style={s.btn} onClick={handleSubmit} disabled={loading}>{loading ? 'Iniciando...' : 'Iniciar Sesion'}</button>
      </div>
    </div>
  );
}
