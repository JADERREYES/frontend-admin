import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Cobradores from './pages/Cobradores';
import Clientes from './pages/Clientes';
import Cartera from './pages/Cartera';
import Calendario from './pages/Calendario';
import Inventario from './pages/Inventario';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('admin_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setUser(null);
  };

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <BrowserRouter>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cobradores" element={<Cobradores />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/cartera" element={<Cartera />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/inventario" element={<Inventario />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
