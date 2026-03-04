import React, { useState, useEffect } from 'react';
import { prestamosAPI, cobradoresAPI, clientesAPI } from '../services/api';

const fmt = n => `$ ${Number(n || 0).toLocaleString('es-CO')}`;

const s = {
  page: { padding: '28px 32px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  pageTitle: { fontSize: '24px', fontWeight: '800', color: '#1e293b' },
  pageSub: { fontSize: '14px', color: '#64748b' },
  addBtn: { background: '#16a34a', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { background: '#fff', borderRadius: '12px', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  statLabel: { fontSize: '13px', color: '#64748b', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' },
  statValue: { fontSize: '22px', fontWeight: '800' },
  card: { background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  filterRow: { display: 'flex', gap: '12px', marginBottom: '16px' },
  searchInput: { flex: 1, padding: '10px 16px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' },
  select: { padding: '10px 16px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', background: '#fff', outline: 'none', cursor: 'pointer' },
  th: { textAlign: 'left', padding: '10px 12px', fontSize: '13px', fontWeight: '600', color: '#64748b', borderBottom: '2px solid #f1f5f9' },
  td: { padding: '14px 12px', fontSize: '14px', color: '#374151', borderBottom: '1px solid #f8fafc', verticalAlign: 'middle' },
  progressWrap: { minWidth: '160px' },
  progressBar: { height: '6px', background: '#f1f5f9', borderRadius: '4px', marginBottom: '4px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '4px' },
  badgePendiente: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: '#fef9c3', color: '#854d0e' },
  badgePagado: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: '#d1fae5', color: '#065f46' },
  pagoBtn: { background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' },
  modal: { background: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '480px' },
  modalTitle: { fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '20px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' },
  input: { width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', marginBottom: '14px', outline: 'none' },
  modalSelect: { width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', marginBottom: '14px', background: '#fff', outline: 'none' },
  modalBtns: { display: 'flex', gap: '10px', marginTop: '8px' },
  cancelBtn: { flex: 1, padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', background: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  saveBtn: { flex: 1, padding: '12px', border: 'none', borderRadius: '8px', background: '#16a34a', fontSize: '14px', fontWeight: '700', cursor: 'pointer', color: '#fff' },
};

export default function Cartera() {
  const [prestamos, setPrestamos] = useState([]);
  const [cobradores, setCobradores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState('');
  const [cobradorFilter, setCobradorFilter] = useState('');
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [showNuevoModal, setShowNuevoModal] = useState(false);
  const [selectedPrestamo, setSelectedPrestamo] = useState(null);
  const [montoPago, setMontoPago] = useState('');
  const [nuevoForm, setNuevoForm] = useState({ clienteId: '', cobradorId: '', capital: '', interes: 20, numeroCuotas: 30, frecuencia: 'diario' });
  const [saving, setSaving] = useState(false);

  const fetchPrestamos = async () => {
    try {
      const res = await prestamosAPI.getAll({ cobrador: cobradorFilter });
      setPrestamos(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    cobradoresAPI.getAll().then(r => setCobradores(r.data)).catch(console.error);
    clientesAPI.getAll().then(r => setClientes(r.data)).catch(console.error);
  }, []);

  useEffect(() => { fetchPrestamos(); }, [cobradorFilter]);

  const filtered = prestamos.filter(p =>
    !search || p.cliente?.nombre?.toLowerCase().includes(search.toLowerCase())
  );

  const totalCartera = prestamos.reduce((s, p) => s + p.totalAPagar, 0);
  const totalRecaudado = prestamos.reduce((s, p) => s + p.totalPagado, 0);
  const porCobrar = totalCartera - totalRecaudado;
  const activos = prestamos.filter(p => p.estado === 'activo').length;

  const handlePago = async () => {
    const monto = parseFloat(montoPago);
    if (!monto) return alert('Ingrese monto válido');
    setSaving(true);
    try {
      await prestamosAPI.registrarPago({ prestamoId: selectedPrestamo._id, monto });
      setShowPagoModal(false); setMontoPago('');
      fetchPrestamos();
    } catch (e) { alert(e.response?.data?.error || 'Error'); }
    finally { setSaving(false); }
  };

  const handleNuevoPrestamo = async () => {
    if (!nuevoForm.clienteId || !nuevoForm.capital) return alert('Complete los campos requeridos');
    setSaving(true);
    try {
      await prestamosAPI.create({ ...nuevoForm, capital: parseFloat(nuevoForm.capital) });
      setShowNuevoModal(false);
      fetchPrestamos();
    } catch (e) { alert(e.response?.data?.error || 'Error'); }
    finally { setSaving(false); }
  };

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <div><div style={s.pageTitle}>Cartera</div><div style={s.pageSub}>Gestiona los prestamos y pagos</div></div>
        <button style={s.addBtn} onClick={() => setShowNuevoModal(true)}>+ Nuevo Prestamo</button>
      </div>

      <div style={s.statsGrid}>
        {[
          { label: 'Cartera Total', value: fmt(totalCartera), icon: '🗂️', color: '#1e293b', bg: '#fff' },
          { label: 'Total Recaudado', value: fmt(totalRecaudado), icon: '📈', color: '#16a34a', bg: '#fef9c3' },
          { label: 'Por Cobrar', value: fmt(porCobrar), icon: '📉', color: '#ef4444', bg: '#fee2e2' },
          { label: 'Préstamos Activos', value: activos, icon: '💳', color: '#1e293b', bg: '#fff' },
        ].map((st, i) => (
          <div key={i} style={{ ...s.statCard, background: st.bg }}>
            <div style={s.statLabel}><span style={{ color: st.bg !== '#fff' ? '#78350f' : '#64748b' }}>{st.label}</span><span>{st.icon}</span></div>
            <div style={{ ...s.statValue, color: st.color }}>{st.value}</div>
          </div>
        ))}
      </div>

      <div style={s.card}>
        <div style={s.filterRow}>
          <input style={s.searchInput} placeholder="Buscar por nombre de cliente..." value={search} onChange={e => setSearch(e.target.value)} />
          <select style={s.select} value={cobradorFilter} onChange={e => setCobradorFilter(e.target.value)}>
            <option value="">Todos los cobradores</option>
            {cobradores.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
          </select>
        </div>
        <table>
          <thead>
            <tr>{['Cliente','Cobrador','Capital','Total','Pagado','Pendiente','Progreso','Estado','Acciones'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const pct = p.totalAPagar > 0 ? Math.round((p.totalPagado / p.totalAPagar) * 100) : 0;
              const restante = p.totalAPagar - p.totalPagado;
              const pagado = p.estado === 'pagado';
              return (
                <tr key={p._id}>
                  <td style={{ ...s.td, fontWeight: '600' }}>{p.cliente?.nombre}</td>
                  <td style={s.td}>{p.cobrador?.nombre}</td>
                  <td style={s.td}>{fmt(p.capital)}</td>
                  <td style={s.td}>{fmt(p.totalAPagar)}</td>
                  <td style={{ ...s.td, color: '#16a34a', fontWeight: '600' }}>{fmt(p.totalPagado)}</td>
                  <td style={{ ...s.td, color: '#ef4444', fontWeight: '600' }}>{fmt(restante)}</td>
                  <td style={s.td}>
                    <div style={s.progressWrap}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                        <span>{pct}%</span><span>{fmt(p.totalPagado)} / {fmt(p.totalAPagar)}</span>
                      </div>
                      <div style={s.progressBar}><div style={{ ...s.progressFill, width: `${pct}%`, background: pagado ? '#22c55e' : '#0d9488' }} /></div>
                      <div style={{ fontSize: '11px', color: '#ef4444' }}>Restante: {fmt(restante)}</div>
                    </div>
                  </td>
                  <td style={s.td}><span style={pagado ? s.badgePagado : s.badgePendiente}>{pagado ? 'Pagado' : 'Pendiente'}</span></td>
                  <td style={s.td}>
                    {!pagado && (
                      <button style={s.pagoBtn} onClick={() => { setSelectedPrestamo(p); setMontoPago(''); setShowPagoModal(true); }}>
                        💵 Pago
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showPagoModal && selectedPrestamo && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setShowPagoModal(false)}>
          <div style={s.modal}>
            <div style={s.modalTitle}>Registrar Pago - {selectedPrestamo.cliente?.nombre}</div>
            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', marginBottom: '20px', fontSize: '14px' }}>
              <div>Total: <strong>{fmt(selectedPrestamo.totalAPagar)}</strong></div>
              <div>Pagado: <strong style={{ color: '#16a34a' }}>{fmt(selectedPrestamo.totalPagado)}</strong></div>
              <div>Restante: <strong style={{ color: '#ef4444' }}>{fmt(selectedPrestamo.totalAPagar - selectedPrestamo.totalPagado)}</strong></div>
            </div>
            <label style={s.label}>Monto del Pago *</label>
            <input style={s.input} type="number" placeholder="Ingrese monto" value={montoPago} onChange={e => setMontoPago(e.target.value)} autoFocus />
            <div style={s.modalBtns}>
              <button style={s.cancelBtn} onClick={() => setShowPagoModal(false)}>Cancelar</button>
              <button style={s.saveBtn} onClick={handlePago} disabled={saving}>{saving ? 'Registrando...' : 'Registrar Pago'}</button>
            </div>
          </div>
        </div>
      )}

      {showNuevoModal && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setShowNuevoModal(false)}>
          <div style={s.modal}>
            <div style={s.modalTitle}>Nuevo Préstamo</div>
            <label style={s.label}>Cliente *</label>
            <select style={s.modalSelect} value={nuevoForm.clienteId} onChange={e => {
              const c = clientes.find(x => x._id === e.target.value);
              setNuevoForm({...nuevoForm, clienteId: e.target.value, cobradorId: c?.cobrador?._id || ''});
            }}>
              <option value="">Seleccionar cliente</option>
              {clientes.map(c => <option key={c._id} value={c._id}>{c.nombre} - CC: {c.cedula}</option>)}
            </select>
            <label style={s.label}>Cobrador *</label>
            <select style={s.modalSelect} value={nuevoForm.cobradorId} onChange={e => setNuevoForm({...nuevoForm, cobradorId: e.target.value})}>
              <option value="">Seleccionar cobrador</option>
              {cobradores.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
            </select>
            <label style={s.label}>Capital ($) *</label>
            <input style={s.input} type="number" placeholder="Ej: 500000" value={nuevoForm.capital} onChange={e => setNuevoForm({...nuevoForm, capital: e.target.value})} />
            <label style={s.label}>Interés (%)</label>
            <input style={s.input} type="number" value={nuevoForm.interes} onChange={e => setNuevoForm({...nuevoForm, interes: parseFloat(e.target.value) || 0})} />
            <label style={s.label}>Número de Cuotas</label>
            <input style={s.input} type="number" value={nuevoForm.numeroCuotas} onChange={e => setNuevoForm({...nuevoForm, numeroCuotas: parseInt(e.target.value) || 1})} />
            <label style={s.label}>Frecuencia</label>
            <select style={s.modalSelect} value={nuevoForm.frecuencia} onChange={e => setNuevoForm({...nuevoForm, frecuencia: e.target.value})}>
              <option value="diario">Diario</option>
              <option value="semanal">Semanal</option>
              <option value="quincenal">Quincenal</option>
              <option value="mensual">Mensual</option>
            </select>
            <div style={s.modalBtns}>
              <button style={s.cancelBtn} onClick={() => setShowNuevoModal(false)}>Cancelar</button>
              <button style={s.saveBtn} onClick={handleNuevoPrestamo} disabled={saving}>{saving ? 'Creando...' : 'Crear Préstamo'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
