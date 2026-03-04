import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { path: '/cobradores', label: 'Cobradores', icon: '👤' },
  { path: '/clientes', label: 'Clientes', icon: '👥' },
  { path: '/cartera', label: 'Cartera', icon: '🗂️' },
  { path: '/calendario', label: 'Calendario', icon: '📅' },
  { path: '/inventario', label: 'Inventario', icon: '📦' },
];

const s = {
  wrapper: { display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' },
  header: { background: '#eab308', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  logo: { width: '36px', height: '36px', background: '#16a34a', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' },
  headerTitle: { fontSize: '16px', fontWeight: '800', color: '#1a1a1a', lineHeight: '1.2' },
  headerSub: { fontSize: '12px', color: '#78350f' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  userInfo: { textAlign: 'right' },
  userName: { fontSize: '14px', fontWeight: '700', color: '#1a1a1a' },
  userEmail: { fontSize: '12px', color: '#78350f' },
  logoutBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#1a1a1a' },
  body: { display: 'flex', flex: 1, overflow: 'hidden' },
  sidebar: { width: '220px', background: '#16a34a', padding: '16px 0', flexShrink: 0, overflowY: 'auto' },
  navItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px', fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', borderRadius: '0', transition: 'background 0.15s', userSelect: 'none' },
  navItemActive: { background: '#15803d', color: '#fff', borderLeft: '3px solid #eab308' },
  navIcon: { fontSize: '16px', flexShrink: 0 },
  main: { flex: 1, overflowY: 'auto', background: '#f5f5f0' },
};

export default function Layout({ children, user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={s.wrapper}>
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.logo}>💵</div>
          <div>
            <div style={s.headerTitle}>GOTA A GOTA</div>
            <div style={s.headerSub}>Panel de Oficina</div>
          </div>
        </div>
        <div style={s.headerRight}>
          <div style={s.userInfo}>
            <div style={s.userName}>{user.nombre || 'Administrador'}</div>
            <div style={s.userEmail}>{user.email}</div>
          </div>
          <button style={s.logoutBtn} onClick={onLogout} title="Cerrar sesión">⬆️</button>
        </div>
      </div>
      <div style={s.body}>
        <div style={s.sidebar}>
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <div
                key={item.path}
                style={{ ...s.navItem, ...(active ? s.navItemActive : {}) }}
                onClick={() => navigate(item.path)}
              >
                <span style={s.navIcon}>{item.icon}</span>
                {item.label}
              </div>
            );
          })}
        </div>
        <div style={s.main}>{children}</div>
      </div>
    </div>
  );
}
