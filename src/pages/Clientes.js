import React, { useState, useEffect } from 'react';
import { clientesAPI, cobradoresAPI } from '../services/api';

const s = {
  page: { padding: '28px 32px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  pageTitle: { fontSize: '24px', fontWeight: '800', color: '#1e293b' },
  pageSub: { fontSize: '14px', color: '#64748b' },
  addBtn: { background: '#16a34a', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' },
  card: { background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  searchRow: { display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' },
  searchInput: { flex: 1, padding: '10px 16px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' },
  countLabel: { fontSize: '14px', color: '#64748b', flexShrink: 0 },
  th: { textAlign: 'left', padding: '10px 12px', fontSize: '13px', fontWeight: '600', color: '#64748b', borderBottom: '2px solid #f1f5f9' },
  td: { padding: '14px 12px', fontSize: '14px', color: '#374151', borderBottom: '1px solid #f8fafc' },
  badge: { padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: '#d1fae5', color: '#065f46' },
  editBtn: { background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#64748b', marginRight: '8px' },
  deleteBtn: { background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#ef4444' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' },
  modal: { background: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '20px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' },
  input: { width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', marginBottom: '14px', outline: 'none' },
  select: { width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', marginBottom: '14px', background: '#fff', outline: 'none' },
  modalBtns: { display: 'flex', gap: '10px', marginTop: '8px' },
  cancelBtn: { flex: 1, padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', background: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  saveBtn: { flex: 1, padding: '12px', border: 'none', borderRadius: '8px', background: '#16a34a', fontSize: '14px', fontWeight: '700', cursor: 'pointer', color: '#fff' },
};

const emptyForm = { nombre: '', cedula: '', celular: '', direccion: '', tipoCliente: 'nuevo', cobrador: '' };

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [cobradores, setCobradores] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchClientes = async () => {
    try {
      const res = await clientesAPI.getAll(search);
      setClientes(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    cobradoresAPI.getAll().then(r => setCobradores(r.data)).catch(console.error);
  }, []);

  useEffect(() => { fetchClientes(); }, [search]);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({ nombre: c.nombre, cedula: c.cedula, celular: c.celular, direccion: c.direccion, tipoCliente: c.tipoCliente, cobrador: c.cobrador?._id || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.nombre || !form.cedula || !form.celular || !form.direccion || !form.cobrador) return alert('Complete todos los campos');
    setSaving(true);
    try {
      if (editing) {
        await clientesAPI.update(editing._id, form);
      } else {
        await clientesAPI.create(form);
      }
      setShowModal(false);
      fetchClientes();
    } catch (e) { alert(e.response?.data?.error || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Desactivar este cliente?')) return;
    try { await clientesAPI.delete(id); fetchClientes(); } catch (e) { alert('Error'); }
  };

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <div><div style={s.pageTitle}>Clientes</div><div style={s.pageSub}>Gestiona los clientes del sistema</div></div>
        <button style={s.addBtn} onClick={openAdd}>+ Nuevo Cliente</button>
      </div>
      <div style={s.card}>
        <div style={s.searchRow}>
          <input style={s.searchInput} placeholder="Buscar por nombre, cedula o telefono..." value={search} onChange={e => setSearch(e.target.value)} />
          <span style={s.countLabel}>{clientes.length} clientes encontrados</span>
        </div>
        <table>
          <thead>
            <tr>{['Nombre','Cedula','Telefono','Direccion','Cobrador','Estado','Acciones'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {clientes.map(c => (
              <tr key={c._id}>
                <td style={{ ...s.td, fontWeight: '600' }}>{c.nombre}</td>
                <td style={s.td}>{c.cedula}</td>
                <td style={s.td}>{c.celular}</td>
                <td style={s.td}>{c.direccion}</td>
                <td style={s.td}>{c.cobrador?.nombre || '-'}</td>
                <td style={s.td}><span style={s.badge}>{c.estado}</span></td>
                <td style={s.td}>
                  <button style={s.editBtn} onClick={() => openEdit(c)}>✏️</button>
                  <button style={s.deleteBtn} onClick={() => handleDelete(c._id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={s.modal}>
            <div style={s.modalTitle}>{editing ? 'Editar Cliente' : 'Nuevo Cliente'}</div>
            <label style={s.label}>Nombre *</label>
            <input style={s.input} placeholder="Nombre completo" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
            <label style={s.label}>Cédula *</label>
            <input style={s.input} placeholder="Número de cédula" value={form.cedula} onChange={e => setForm({...form, cedula: e.target.value})} />
            <label style={s.label}>Celular *</label>
            <input style={s.input} placeholder="Número de celular" value={form.celular} onChange={e => setForm({...form, celular: e.target.value})} />
            <label style={s.label}>Dirección *</label>
            <input style={s.input} placeholder="Dirección" value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} />
            <label style={s.label}>Cobrador *</label>
            <select style={s.select} value={form.cobrador} onChange={e => setForm({...form, cobrador: e.target.value})}>
              <option value="">Seleccionar cobrador</option>
              {cobradores.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
            </select>
            <label style={s.label}>Tipo de Cliente</label>
            <select style={s.select} value={form.tipoCliente} onChange={e => setForm({...form, tipoCliente: e.target.value})}>
              <option value="nuevo">Nuevo</option>
              <option value="recurrente">Recurrente</option>
              <option value="moroso">Moroso</option>
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
