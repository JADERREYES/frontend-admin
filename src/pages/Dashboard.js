import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';

const fmt = n => `$ ${Number(n || 0).toLocaleString('es-CO')}`;

const s = {
  page: { padding: '28px 32px' },
  pageTitle: { fontSize: '24px', fontWeight: '800', color: '#1e293b' },
  pageSub: { fontSize: '14px', color: '#64748b', marginBottom: '24px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' },
  statCard: { background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  statLabel: { fontSize: '13px', color: '#64748b', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' },
  statValue: { fontSize: '28px', fontWeight: '800', color: '#1e293b' },
  statIcon: { fontSize: '18px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  card: { background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  cardTitle: { fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' },
  prestamoItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' },
  prestamoName: { fontSize: '14px', fontWeight: '600', color: '#1e293b' },
  prestamoCapital: { fontSize: '12px', color: '#64748b', marginTop: '2px' },
  badge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  cobradorItem: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9', fontSize: '14px' },
  cobradorName: { fontWeight: '600', color: '#1e293b' },
  cobradorCC: { fontSize: '12px', color: '#64748b' },
};

const badgeColors = {
  activo: { background: '#fef9c3', color: '#854d0e' },
  pagado: { background: '#d1fae5', color: '#065f46' },
  vencido: { background: '#fee2e2', color: '#991b1b' },
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.get().then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Cargando dashboard...</div>;
  if (!data) return null;

  const { stats, ultimosPrestamos, cobradoresRecientes } = data;

  return (
    <div style={s.page}>
      <div style={s.pageTitle}>Dashboard</div>
      <div style={s.pageSub}>Resumen general del sistema</div>

      <div style={s.statsGrid}>
        {[
          { label: 'Cobradores', value: stats.cobradores, icon: '👤', color: '#1e293b' },
          { label: 'Clientes', value: stats.clientes, icon: '👥', color: '#1e293b' },
          { label: 'Cartera Total', value: fmt(stats.carteraTotal), icon: '🗂️', color: '#1e293b' },
          { label: 'Total Recaudado', value: fmt(stats.totalRecaudado), icon: '📈', color: '#16a34a' },
          { label: 'Por Cobrar', value: fmt(stats.porCobrar), icon: '📉', color: '#ef4444' },
          { label: 'Préstamos Activos', value: stats.prestamosActivos, icon: '💳', color: '#1e293b' },
        ].map((s2, i) => (
          <div key={i} style={s.statCard}>
            <div style={s.statLabel}><span>{s2.label}</span><span style={s.statIcon}>{s2.icon}</span></div>
            <div style={{ ...s.statValue, color: s2.color }}>{s2.value}</div>
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
                <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>{fmt(p.totalAPagar)}</div>
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
              <div style={{ color: '#64748b', fontSize: '13px' }}>{c.telefono}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
