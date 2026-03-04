import React, { useState, useEffect } from 'react';
import { inventarioAPI, cobradoresAPI } from '../services/api';

const s = {
  page: { padding: '28px 32px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  pageTitle: { fontSize: '24px', fontWeight: '800', color: '#1e293b' },
  pageSub: { fontSize: '14px', color: '#64748b' },
  addBtn: { background: '#16a34a', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' },
  card: { background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  filterRow: { display: 'flex', gap: '12px', marginBottom: '16px' },
  searchInput: { flex: 1, padding: '10px 16px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' },
  select: { padding: '10px 16px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', background: '#fff', outline: 'none', cursor: 'pointer', minWidth: '200px' },
  th: { textAlign: 'left', padding: '10px 12px', fontSize: '13px', fontWeight: '600', color: '#64748b', borderBottom: '2px solid #f1f5f9' },
  td: { padding: '14px 12px', fontSize: '14px', color: '#374151', borderBottom: '1px solid #f8fafc' },
  badge: { padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  empty: { textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '14px' },
  editBtn: { background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', marginRight: '8px' },
  deleteBtn: { background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#ef4444' },
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

const estadoColors = {
  disponible: { background: '#d1fae5', color: '#065f46' },
  asignado: { background: '#fef9c3', color: '#854d0e' },
  mantenimiento: { background: '#fee2e2', color: '#991b1b' },
};

const emptyForm = { tipo: '', descripcion: '', serie: '', cobrador: '', estado: 'disponible' };

export default function Inventario() {
  const [items, setItems] = useState([]);
  const [cobradores, setCobradores] = useState([]);
  const [search, setSearch] = useState('');
  const [cobradorFilter, setCobradorFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    try {
      const res = await inventarioAPI.getAll({ search, cobrador: cobradorFilter });
      setItems(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    cobradoresAPI.getAll().then(r => setCobradores(r.data)).catch(console.error);
  }, []);

  useEffect(() => { fetchItems(); }, [search, cobradorFilter]);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({ tipo: item.tipo, descripcion: item.descripcion, serie: item.serie || '', cobrador: item.cobrador?._id || '', estado: item.estado });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.tipo || !form.descripcion) return alert('Complete los campos requeridos');
    setSaving(true);
    try {
      const data = { ...form, cobrador: form.cobrador || null };
      if (editing) await inventarioAPI.update(editing._id, data);
      else await inventarioAPI.create(data);
      setShowModal(false);
      fetchItems();
    } catch (e) { alert(e.response?.data?.error || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este item?')) return;
    try { await inventarioAPI.delete(id); fetchItems(); } catch (e) { alert('Error'); }
  };

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <div><div style={s.pageTitle}>Inventario</div><div style={s.pageSub}>Gestiona los recursos asignados a cobradores</div></div>
        <button style={s.addBtn} onClick={openAdd}>+ Nuevo Item</button>
      </div>
      <div style={s.card}>
        <div style={s.filterRow}>
          <input style={s.searchInput} placeholder="Buscar en inventario..." value={search} onChange={e => setSearch(e.target.value)} />
          <select style={s.select} value={cobradorFilter} onChange={e => setCobradorFilter(e.target.value)}>
            <option value="">Todos los cobradores</option>
            {cobradores.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
          </select>
        </div>
        <table>
          <thead>
            <tr>{['Tipo','Descripcion','Serie','Cobrador','Fecha Asignacion','Estado','Acciones'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={7} style={s.empty}>No hay items en el inventario</td></tr>
            ) : items.map(item => (
              <tr key={item._id}>
                <td style={{ ...s.td, fontWeight: '600' }}>{item.tipo}</td>
                <td style={s.td}>{item.descripcion}</td>
                <td style={s.td}>{item.serie || '-'}</td>
                <td style={s.td}>{item.cobrador?.nombre || '-'}</td>
                <td style={s.td}>{item.fechaAsignacion ? new Date(item.fechaAsignacion).toLocaleDateString('es-CO') : '-'}</td>
                <td style={s.td}><span style={{ ...s.badge, ...(estadoColors[item.estado] || {}) }}>{item.estado}</span></td>
                <td style={s.td}>
                  <button style={s.editBtn} onClick={() => openEdit(item)}>✏️</button>
                  <button style={s.deleteBtn} onClick={() => handleDelete(item._id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={s.modal}>
            <div style={s.modalTitle}>{editing ? 'Editar Item' : 'Nuevo Item'}</div>
            <label style={s.label}>Tipo *</label>
            <input style={s.input} placeholder="Ej: Moto, Tablet, Teléfono" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} />
            <label style={s.label}>Descripción *</label>
            <input style={s.input} placeholder="Descripción detallada" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} />
            <label style={s.label}>Serie / Placa</label>
            <input style={s.input} placeholder="Número de serie o placa" value={form.serie} onChange={e => setForm({...form, serie: e.target.value})} />
            <label style={s.label}>Asignar a Cobrador</label>
            <select style={s.modalSelect} value={form.cobrador} onChange={e => setForm({...form, cobrador: e.target.value})}>
              <option value="">Sin asignar</option>
              {cobradores.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
            </select>
            <label style={s.label}>Estado</label>
            <select style={s.modalSelect} value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}>
              <option value="disponible">Disponible</option>
              <option value="asignado">Asignado</option>
              <option value="mantenimiento">En Mantenimiento</option>
            </select>
            <div style={s.modalBtns}>
              <button style={s.cancelBtn} onClick={() => setShowModal(false)}>Cancelar</button>
              <button style={s.saveBtn} onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
