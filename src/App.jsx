import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, message } from 'antd';
import esES from 'antd/locale/es_ES';

import Test from './pages/Test';
import Login from './pages/Login';
import Layout from './components/Layout';

const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Prestamos = React.lazy(() => import('./pages/Prestamos'));
const Clientes = React.lazy(() => import('./pages/Clientes'));
const Cobradores = React.lazy(() => import('./pages/Cobradores'));
const Cartera = React.lazy(() => import('./pages/Cartera'));
const Calendario = React.lazy(() => import('./pages/Calendario'));
const Inventario = React.lazy(() => import('./pages/Inventario'));
const Pagos = React.lazy(() => import('./pages/Pagos'));
const Reportes = React.lazy(() => import('./pages/Reportes'));
const Configuracion = React.lazy(() => import('./pages/Configuracion'));
const Perfil = React.lazy(() => import('./pages/Perfil'));

message.config({
  top: 100,
  duration: 3,
  maxCount: 3,
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('admin_token');
    const storedUser = localStorage.getItem('admin_user');
    const storedTenantId = localStorage.getItem('tenantId');

    if (storedToken && storedUser && storedTenantId) {
      try {
        const userData = JSON.parse(storedUser);
        if (!userData.tenantId && storedTenantId) {
          userData.tenantId = storedTenantId;
        }
        setUser(userData);
      } catch (e) {
        console.error('Error restaurando sesión:', e);
        localStorage.clear();
      }
    }

    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    message.success('Sesión cerrada correctamente');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Cargando...
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <ConfigProvider locale={esES}>
      <BrowserRouter>
        <Layout user={user} onLogout={handleLogout}>
          <Suspense fallback={<div style={{ padding: '50px', textAlign: 'center' }}>Cargando módulo...</div>}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />

              <Route path="/test" element={<Test />} />

              <Route path="/prestamos" element={<Prestamos />} />
              <Route path="/prestamos/nuevo" element={<Prestamos />} />
              <Route path="/prestamos/editar/:id" element={<Prestamos />} />
              <Route path="/prestamos/:id" element={<Prestamos />} />

              <Route path="/clientes" element={<Clientes />} />
              <Route path="/clientes/nuevo" element={<Clientes />} />
              <Route path="/clientes/:id" element={<Clientes />} />

              <Route path="/cobradores" element={<Cobradores />} />
              <Route path="/cobradores/nuevo" element={<Cobradores />} />
              <Route path="/cobradores/:id" element={<Cobradores />} />

              <Route path="/cartera" element={<Cartera />} />
              <Route path="/calendario" element={<Calendario />} />
              <Route path="/inventario" element={<Inventario />} />
              <Route path="/pagos" element={<Pagos />} />
              <Route path="/reportes" element={<Reportes />} />
              <Route path="/configuracion" element={<Configuracion />} />
              <Route path="/perfil" element={<Perfil />} />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;