import React, { useState } from 'react';
import { authAPI } from '../api/api';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Limpiar espacios en blanco al inicio y final
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    
    if (!cleanEmail || !cleanPassword) {
      setError('Complete todos los campos');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log('🔐 Intentando login:', cleanEmail);
      const res = await authAPI.login(cleanEmail, cleanPassword);
      const { token, user } = res.data;
      
      console.log('📦 Respuesta:', res.data);
      
      if (!token) throw new Error('No se recibió token');
      if (!user) throw new Error('No se recibieron datos de usuario');
      if (!user.tenantId) throw new Error('Usuario sin empresa asignada');

      localStorage.clear();
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(user));
      localStorage.setItem('tenantId', user.tenantId);
      
      console.log('✅ tenantId guardado:', user.tenantId);
      onLogin(user, token);
      
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.response?.data?.error || err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Función para pegar texto sin caracteres especiales
  const handleEmailChange = (e) => {
    let value = e.target.value;
    // Eliminar cualquier carácter que no sea letra, número, @, ., - o _
    value = value.replace(/[^\w\d@.\-_]/g, '');
    setEmail(value);
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#0a0f2a'
    }}>
      <div style={{
        width: 380,
        padding: 40,
        background: '#071a14',
        borderRadius: 16,
        textAlign: 'center',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{ color: '#00ff88', fontSize: 32, marginBottom: 8 }}>Gota a Gota</h1>
        <p style={{ color: '#8c8c8c', marginBottom: 30 }}>Panel de Administración</p>
        
        {error && (
          <div style={{
            background: 'rgba(255,77,79,0.2)',
            border: '1px solid #ff4d4f',
            borderRadius: 8,
            padding: 10,
            marginBottom: 20,
            color: '#ff4d4f'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={handleEmailChange}
            style={{
              width: '100%',
              padding: 12,
              marginBottom: 16,
              background: '#0a1f1a',
              border: '1px solid #00ff88',
              borderRadius: 8,
              color: 'white',
              fontSize: 16
            }}
          />
          
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: 12,
              marginBottom: 24,
              background: '#0a1f1a',
              border: '1px solid #00ff88',
              borderRadius: 8,
              color: 'white',
              fontSize: 16
            }}
          />
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: 12,
              background: '#00ff88',
              border: 'none',
              borderRadius: 8,
              color: '#0a0f2a',
              fontWeight: 'bold',
              fontSize: 16,
              cursor: 'pointer'
            }}
          >
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;