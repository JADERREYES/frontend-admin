import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { path: '/cobradores', label: 'Cobradores', icon: '👤' },
  { path: '/clientes', label: 'Clientes', icon: '👥' },
  { path: '/cartera', label: 'Cartera', icon: '🗂️' },
  { path: '/calendario', label: 'Calendario', icon: '📅' },
  { path: '/inventario', label: 'Inventario', icon: '📦' },

  /* NUEVO */
  { path: '/sedes', label: 'Sedes', icon: '🏢' },
];

const s = {
  wrapper: {
    display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden',
    background: '#020c0a',
  },
  header: {
    background: '#010f0c',
    borderBottom: '1px solid rgba(0,255,136,0.12)',
    padding: '0 28px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    height: '60px', flexShrink: 0,
    position: 'relative',
  },
  headerGlow: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(0,255,136,0.4), rgba(0,229,255,0.4), transparent)',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '14px' },
  logo: {
    width: '36px', height: '36px',
    background: 'linear-gradient(135deg, #00ff88, #00e5ff)',
    borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px', flexShrink: 0,
    boxShadow: '0 0 16px rgba(0,255,136,0.4)',
  },
  headerTitle: {
    fontSize: '15px', fontWeight: '800', color: '#00ff88',
    letterSpacing: '0.08em', lineHeight: '1.2',
    fontFamily: "'JetBrains Mono', monospace",
  },
  headerSub: { fontSize: '11px', color: '#5a8a6e', letterSpacing: '0.05em' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  userBadge: {
    display: 'flex', alignItems: 'center', gap: '10px',
    background: 'rgba(0,255,136,0.06)',
    border: '1px solid rgba(0,255,136,0.12)',
    borderRadius: '10px', padding: '7px 14px',
  },
  userDot: {
    width: '8px', height: '8px', borderRadius: '50%',
    background: '#00ff88',
    boxShadow: '0 0 8px rgba(0,255,136,0.8)',
    animation: 'pulse 2s infinite',
  },
  userInfo: { textAlign: 'right' },
  userName: { fontSize: '13px', fontWeight: '700', color: '#e2ffe8' },
  userEmail: { fontSize: '11px', color: '#5a8a6e' },
  logoutBtn: {
    background: 'rgba(255,68,102,0.08)',
    border: '1px solid rgba(255,68,102,0.2)',
    borderRadius: '8px', padding: '8px 10px',
    color: '#ff4466', fontSize: '14px', cursor: 'pointer',
    transition: 'all 0.2s',
  },
  body: { display: 'flex', flex: 1, overflow: 'hidden' },
  sidebar: {
    width: '220px',
    background: '#010f0c',
    borderRight: '1px solid rgba(0,255,136,0.08)',
    padding: '20px 0', flexShrink: 0, overflowY: 'auto',
  },
  sidebarLabel: {
    fontSize: '10px', fontWeight: '700', color: '#2a5a3e',
    letterSpacing: '0.12em', padding: '0 20px 10px',
    fontFamily: "'JetBrains Mono', monospace",
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '11px 20px', fontSize: '13px', fontWeight: '600',
    color: '#5a8a6e', cursor: 'pointer',
    transition: 'all 0.2s', userSelect: 'none',
    borderLeft: '2px solid transparent',
    margin: '1px 0',
  },
  navItemActive: {
    color: '#00ff88', background: 'rgba(0,255,136,0.07)',
    borderLeft: '2px solid #00ff88',
  },
  navIcon: { fontSize: '15px', flexShrink: 0 },
  main: { flex: 1, overflowY: 'auto', background: '#020c0a' },
};

const styleTag = `
  @keyframes pulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(0,255,136,0.8); }
    50% { opacity: 0.5; box-shadow: 0 0 4px rgba(0,255,136,0.3); }
  }
`;

export default function Layout({ children, user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <style>{styleTag}</style>

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
            <div style={s.userBadge}>
              <div style={s.userDot}></div>
              <div style={s.userInfo}>
                <div style={s.userName}>{user.nombre || 'Administrador'}</div>
                <div style={s.userEmail}>{user.email}</div>
              </div>
            </div>

            <button style={s.logoutBtn} onClick={onLogout} title="Cerrar sesión">
              ⬆️
            </button>
          </div>

          <div style={s.headerGlow}></div>
        </div>

        <div style={s.body}>

          <div style={s.sidebar}>
            <div style={s.sidebarLabel}>NAVEGACIÓN</div>

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

          <div style={s.main}>
            {children}
          </div>

        </div>
      </div>
    </>
  );
}