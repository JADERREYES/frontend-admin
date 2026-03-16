import React, { useState, useEffect } from 'react';
import { dashboardAPI, carteraAPI } from '../services/api';
import DashboardCharts from "../components/DashboardCharts";

const fmt = n => `$ ${Number(n || 0).toLocaleString('es-CO')}`;

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [carteraData, setCarteraData] = useState(null);
  const [prestamos, setPrestamos] = useState([]); // ✅ NUEVO: para la tabla
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar datos del dashboard, cartera y préstamos en paralelo
    Promise.all([
      dashboardAPI.get(),
      carteraAPI.getResumen(),
      carteraAPI.getPrestamos() // ✅ NUEVO: obtener préstamos para la tabla
    ])
    .then(([dashboardRes, carteraRes, prestamosRes]) => {
      setData(dashboardRes.data);
      setCarteraData(carteraRes.data);
      setPrestamos(prestamosRes.data || []);
    })
    .catch(error => {
      console.error('❌ Error cargando dashboard:', error);
    })
    .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Cargando dashboard...</div>;
  }

  if (!data) return null;

  const { stats, ultimosPrestamos, cobradoresRecientes, metricasSede } = data;
  const carteraResumen = carteraData?.resumen || {};
  const pagosResumen = carteraData?.pagos || {};

  return (
    <div style={{ padding: "30px" }}>
      <h2>Dashboard</h2>

      <h3>Resumen General</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <Tarjeta 
          titulo="Cobradores" 
          valor={stats.cobradores} 
          color="#0d9488" 
          icono="👥"
        />
        <Tarjeta 
          titulo="Clientes" 
          valor={stats.clientes} 
          color="#3b82f6" 
          icono="👤"
        />
        <Tarjeta 
          titulo="Cartera Total" 
          valor={fmt(carteraResumen.totalAPagar || 0)} 
          color="#8b5cf6" 
          icono="💰"
        />
        <Tarjeta 
          titulo="Recaudado Hoy" 
          valor={fmt(pagosResumen.hoy?.total || 0)} 
          color="#22c55e" 
          icono="💵"
        />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h4>Por Cobrar</h4>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#ef4444' }}>
            {fmt(carteraResumen.saldoPendiente || 0)}
          </p>
          <p>Préstamos activos: {carteraResumen.totalPrestamos || 0}</p>
        </div>

        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h4>Recaudado del Mes</h4>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#0d9488' }}>
            {fmt(pagosResumen.mes?.total || 0)}
          </p>
          <p>Total de pagos: {pagosResumen.mes?.cantidad || 0}</p>
        </div>
      </div>

      <hr />

      {/* Sección de Dashboard por Sede */}
      <h3>Dashboard por Sede</h3>
      {metricasSede?.length === 0 ? (
        <p>No hay sedes registradas</p>
      ) : (
        metricasSede?.map((s, i) => (
          <div key={i} style={{
            border: "1px solid #ddd",
            borderRadius: '8px',
            padding: "15px",
            marginBottom: "10px",
            background: '#fff'
          }}>
            <h4>{s.sede}</h4>
            <p>Clientes: {s.clientes}</p>
            <p>Préstamos activos: {s.prestamos}</p>
            <p>Cobros hoy: {fmt(s.cobrosHoy)}</p>
          </div>
        ))
      )}

      <hr />

      {/* Tabla de Últimos Préstamos (mejorada) */}
      <h3>Últimos Préstamos</h3>
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {prestamos.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
            No hay préstamos registrados
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={thStyle}>Cliente</th>
                <th style={thStyle}>Cobrador</th>
                <th style={thStyle}>Capital</th>
                <th style={thStyle}>Total</th>
                <th style={thStyle}>Pagado</th>
                <th style={thStyle}>Pendiente</th>
                <th style={thStyle}>Progreso</th>
                <th style={thStyle}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {prestamos.slice(0, 10).map(p => (
                <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={tdStyle}>{p.cliente}</td>
                  <td style={tdStyle}>{p.cobrador}</td>
                  <td style={tdStyle}>{fmt(p.capital)}</td>
                  <td style={tdStyle}>{fmt(p.totalAPagar)}</td>
                  <td style={{ ...tdStyle, color: '#22c55e' }}>{fmt(p.totalPagado)}</td>
                  <td style={{ ...tdStyle, color: '#ef4444' }}>{fmt(p.pendiente)}</td>
                  <td style={tdStyle}>
                    <div style={{
                      width: '80px',
                      height: '8px',
                      background: '#f1f5f9',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${p.progreso}%`,
                        height: '100%',
                        background: '#0d9488'
                      }} />
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '4px 8px',
                      background: p.estado === 'activo' ? '#d1fae5' : '#fee2e2',
                      color: p.estado === 'activo' ? '#065f46' : '#991b1b',
                      borderRadius: '20px',
                      fontSize: '12px'
                    }}>
                      {p.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <hr />

      {/* Cobradores Recientes */}
      <h3>Cobradores Recientes</h3>
      <div style={{
        background: '#fff',
        borderRadius: '8px',
        padding: '15px',
        border: '1px solid #ddd'
      }}>
        {cobradoresRecientes?.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
            No hay cobradores registrados
          </p>
        ) : (
          cobradoresRecientes?.map(c => (
            <div key={c._id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid #eee'
            }}>
              <span>{c.nombre}</span>
              <span style={{ color: '#666' }}>{c.telefono}</span>
            </div>
          ))
        )}
      </div>

      {/* DashboardCharts */}
      <DashboardCharts data={carteraData} />
    </div>
  );
}

// Componente Tarjeta reutilizable
function Tarjeta({ titulo, valor, color, icono }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>{titulo}</p>
        <p style={{ fontSize: '28px', fontWeight: '700', color }}>{valor}</p>
      </div>
      <div style={{
        width: '48px',
        height: '48px',
        background: `${color}20`,
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        color
      }}>
        {icono}
      </div>
    </div>
  );
}

const thStyle = {
  textAlign: 'left',
  padding: '12px 8px',
  fontSize: '14px',
  fontWeight: '600',
  color: '#64748b'
};

const tdStyle = {
  padding: '12px 8px',
  fontSize: '14px',
  color: '#1e293b'
};