import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';

const fmt = n => `$ ${Number(n || 0).toLocaleString('es-CO')}`;

const styleTag = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .stat-card {
    animation: fadeUp 0.4s ease both;
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  }
  .stat-card:hover {
    transform: translateY(-2px);
    border-color: rgba(0,255,136,0.25) !important;
    box-shadow: 0 8px 32px rgba(0,255,136,0.08) !important;
  }
`;

const s = {
  page: { padding: '28px 32px', minHeight: '100%' },
  header: { marginBottom: '28px' },
  pageTitle: {
    fontSize: '22px', fontWeight: '800', color: '#e2ffe8',
    letterSpacing: '-0.01em',
  },
  pageSub: {
    fontSize: '12px', color: '#5a8a6e', marginTop: '4px',
    fontFamily: "'JetBrains Mono', monospace",
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '14px', marginBottom: '24px',
  },
  statCard: {
    background: '#071a14',
    border: '1px solid rgba(0,255,136,0.1)',
    borderRadius: '14px', padding: '20px',
  },
  statLabel: {
    fontSize: '11px', color: '#5a8a6e', marginBottom: '10px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontFamily: "'JetBrains Mono', monospace",
    textTransform: 'uppercase', letterSpacing: '0.06em',
  },
  statValue: { fontSize: '26px', fontWeight: '800', color: '#e2ffe8' },
  statIcon: { fontSize: '16px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  card: {
    background: '#071a14',
    border: '1px solid rgba(0,255,136,0.1)',
    borderRadius: '14px', padding: '20px',
  },
  cardTitle: {
    fontSize: '13px', fontWeight: '700', color: '#00ff88',
    marginBottom: '16px', textTransform: 'uppercase',
    letterSpacing: '0.08em', fontFamily: "'JetBrains Mono', monospace",
  },
  prestamoItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 0', borderBottom: '1px solid rgba(0,255,136,0.06)',
  },
  prestamoName: { fontSize: '14px', fontWeight: '600', color: '#e2ffe8' },
  prestamoCapital: { fontSize: '11px', color: '#5a8a6e', marginTop: '2px', fontFamily: "'JetBrains Mono', monospace" },
  badge: { padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', fontFamily: "'JetBrains Mono', monospace" },
  cobradorItem: {
    display: 'flex', justifyContent: 'space-between',
    padding: '12px 0', borderBottom: '1px solid rgba(0,255,136,0.06)',
  },
  cobradorName: { fontSize: '14px', fontWeight: '600', color: '#e2ffe8' },
  cobradorCC: { fontSize: '11px', color: '#5a8a6e', marginTop: '2px', fontFamily: "'JetBrains Mono', monospace" },
};

const badgeColors = {
  activo: { background: 'rgba(255,204,0,0.1)', color: '#ffcc00', border: '1px solid rgba(255,204,0,0.2)' },
  pagado: { background: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' },
  vencido: { background: 'rgba(255,68,102,0.1)', color: '#ff4466', border: '1px solid rgba(255,68,102,0.2)' },
};

const statColors = {
  'Total Recaudado': '#00ff88',
  'Por Cobrar': '#ff4466',
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.get().then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding: '60px', textAlign: 'center', color: '#5a8a6e', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px' }}>
      [ cargando_dashboard... ]
    </div>
  );
  if (!data) return null;

  const { stats, ultimosPrestamos, cobradoresRecientes } = data;

  return (
    <>
      <style>{styleTag}</style>
      <div style={s.page}>
        <div style={s.header}>
          <div style={s.pageTitle}>Dashboard</div>
          <div style={s.pageSub}>// resumen_general_del_sistema</div>
        </div>

        <div style={s.statsGrid}>
          {[
            { label: 'Cobradores', value: stats.cobradores, icon: '👤' },
            { label: 'Clientes', value: stats.clientes, icon: '👥' },
            { label: 'Cartera Total', value: fmt(stats.carteraTotal), icon: '🗂️' },
            { label: 'Total Recaudado', value: fmt(stats.totalRecaudado), icon: '📈' },
            { label: 'Por Cobrar', value: fmt(stats.porCobrar), icon: '📉' },
            { label: 'Préstamos Activos', value: stats.prestamosActivos, icon: '💳' },
          ].map((item, i) => (
            <div key={i} className="stat-card" style={{ ...s.statCard, animationDelay: `${i * 0.06}s` }}>
              <div style={s.statLabel}>
                <span>{item.label}</span>
                <span style={s.statIcon}>{item.icon}</span>
              </div>
              <div style={{ ...s.statValue, color: statColors[item.label] || '#e2ffe8' }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div style={s.grid2}>
          <div style={s.card}>
            <div style={s.cardTitle}>Últimos Préstamos</div>
            {ultimosPrestamos?.slice(0, 5).map(p => (
              <div key={p._id} style={s.prestamoItem}>
                <div>
                  <div style={s.prestamoName}>{p.cliente}</div>
                  <div style={s.prestamoCapital}>Capital: {fmt(p.capital)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '700', fontSize: '13px', color: '#e2ffe8', marginBottom: '5px', fontFamily: "'JetBrains Mono', monospace" }}>
                    {fmt(p.totalAPagar)}
                  </div>
                  <span style={{ ...s.badge, ...(badgeColors[p.estado] || badgeColors.activo) }}>
                    {p.estado === 'activo' ? 'Pendiente' : p.estado === 'pagado' ? 'Pagado' : p.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div style={s.card}>
            <div style={s.cardTitle}>Cobradores Recientes</div>
            {cobradoresRecientes?.map(c => (
              <div key={c._id} style={s.cobradorItem}>
                <div>
                  <div style={s.cobradorName}>{c.nombre}</div>
                  <div style={s.cobradorCC}>CC: {c.cedula}</div>
                </div>
                <div style={{ color: '#5a8a6e', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" }}>{c.telefono}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}