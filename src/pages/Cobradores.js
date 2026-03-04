import React, { useState, useEffect } from "react";
import { cobradoresAPI } from "../services/api";

const fmt = n => "$ " + Number(n||0).toLocaleString("es-CO");

const emptyForm = { nombre:"", cedula:"", email:"", telefono:"", zona:"", password:"" };

export default function Cobradores() {
  const [cobradores, setCobradores] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchCobradores = async () => {
    try { const res = await cobradoresAPI.getAll(search); setCobradores(res.data); }
    catch(e) { console.error(e); }
  };

  useEffect(() => { fetchCobradores(); }, [search]);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = c => {
    setEditing(c);
    setForm({ nombre:c.nombre, cedula:c.cedula, email:c.email||"", telefono:c.telefono, zona:c.zona||"", password:"" });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.nombre||!form.cedula||!form.email||!form.telefono) return alert("Complete los campos requeridos");
    if (!editing && !form.password) return alert("Ingrese una contrasena");
    if (form.password && form.password.length<6) return alert("Minimo 6 caracteres");
    setSaving(true);
    try {
      if (editing) await cobradoresAPI.update(editing._id, form);
      else await cobradoresAPI.create(form);
      setShowModal(false); fetchCobradores();
    } catch(e) { alert(e.response?.data?.error||"Error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm("Desactivar este cobrador?")) return;
    try { await cobradoresAPI.delete(id); fetchCobradores(); } catch(e) { alert("Error"); }
  };

  const sInput = { width:"100%", padding:"11px 14px", border:"1.5px solid #e2e8f0", borderRadius:"8px", fontSize:"14px", marginBottom:"14px", outline:"none", boxSizing:"border-box" };
  const sLabel = { display:"block", fontSize:"13px", fontWeight:"600", color:"#374151", marginBottom:"6px" };

  return (
    <div style={{ padding:"28px 32px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"24px" }}>
        <div>
          <div style={{ fontSize:"24px", fontWeight:"800", color:"#1e293b" }}>Cobradores</div>
          <div style={{ fontSize:"14px", color:"#64748b" }}>Gestiona los cobradores del sistema</div>
        </div>
        <button style={{ background:"#16a34a", color:"#fff", border:"none", borderRadius:"10px", padding:"10px 20px", fontWeight:"700", fontSize:"14px", cursor:"pointer" }} onClick={openAdd}>
          + Nuevo Cobrador
        </button>
      </div>

      <div style={{ background:"#fff", borderRadius:"14px", padding:"20px", boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
        <div style={{ display:"flex", gap:"12px", marginBottom:"16px" }}>
          <input style={{ flex:1, padding:"10px 16px", border:"1.5px solid #e2e8f0", borderRadius:"10px", fontSize:"14px", outline:"none" }}
            placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
          <span style={{ fontSize:"14px", color:"#64748b", alignSelf:"center" }}>{cobradores.length} encontrados</span>
        </div>
        <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>
              {["Nombre","Cedula","Email","Telefono","Zona","Clientes","Cartera","Estado","Acciones"].map(h =>
                <th key={h} style={{ textAlign:"left", padding:"10px 12px", fontSize:"13px", fontWeight:"600", color:"#64748b", borderBottom:"2px solid #f1f5f9" }}>{h}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {cobradores.map(c => (
              <tr key={c._id}>
                <td style={{ padding:"14px 12px", fontWeight:"600", borderBottom:"1px solid #f8fafc" }}>{c.nombre}</td>
                <td style={{ padding:"14px 12px", fontSize:"14px", borderBottom:"1px solid #f8fafc" }}>{c.cedula}</td>
                <td style={{ padding:"14px 12px", fontSize:"14px", borderBottom:"1px solid #f8fafc", color:"#0d9488" }}>{c.email}</td>
                <td style={{ padding:"14px 12px", fontSize:"14px", borderBottom:"1px solid #f8fafc" }}>{c.telefono}</td>
                <td style={{ padding:"14px 12px", fontSize:"14px", borderBottom:"1px solid #f8fafc" }}>{c.zona||"-"}</td>
                <td style={{ padding:"14px 12px", fontSize:"14px", borderBottom:"1px solid #f8fafc" }}>{c.clientesCount||0}</td>
                <td style={{ padding:"14px 12px", fontSize:"14px", borderBottom:"1px solid #f8fafc" }}>{fmt(c.cartera)}</td>
                <td style={{ padding:"14px 12px", fontSize:"14px", borderBottom:"1px solid #f8fafc" }}>
                  <span style={{ padding:"3px 10px", borderRadius:"20px", fontSize:"12px", fontWeight:"600", background:"#fef9c3", color:"#854d0e" }}>{c.estado}</span>
                </td>
                <td style={{ padding:"14px 12px", fontSize:"14px", borderBottom:"1px solid #f8fafc" }}>
                  <button style={{ background:"none", border:"none", fontSize:"16px", cursor:"pointer", marginRight:"8px" }} onClick={() => openEdit(c)}>&#9999;&#65039;</button>
                  <button style={{ background:"none", border:"none", fontSize:"16px", cursor:"pointer", color:"#ef4444" }} onClick={() => handleDelete(c._id)}>&#128465;&#65039;</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {cobradores.length===0 && <div style={{ textAlign:"center", padding:"40px", color:"#94a3b8" }}>No hay cobradores</div>}
      </div>

      {showModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:"20px" }}
          onClick={e => e.target===e.currentTarget && setShowModal(false)}>
          <div style={{ background:"#fff", borderRadius:"16px", padding:"28px", width:"100%", maxWidth:"540px", maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ fontSize:"20px", fontWeight:"700", color:"#1e293b", marginBottom:"16px" }}>{editing ? "Editar Cobrador" : "Nuevo Cobrador"}</div>

            <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:"8px", padding:"12px 14px", marginBottom:"18px", fontSize:"13px", color:"#15803d" }}>
              El cobrador podra entrar a la app con su <strong>correo electronico</strong> o <strong>cedula</strong> + contrasena.
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 12px" }}>
              <div>
                <label style={sLabel}>Nombre *</label>
                <input style={sInput} placeholder="Nombre completo" value={form.nombre} onChange={e => setForm({...form, nombre:e.target.value})} />
              </div>
              <div>
                <label style={sLabel}>Cedula *</label>
                <input style={sInput} placeholder="Numero de cedula" value={form.cedula} onChange={e => setForm({...form, cedula:e.target.value})} />
              </div>
            </div>

            <label style={sLabel}>Correo Electronico *</label>
            <input style={sInput} type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={e => setForm({...form, email:e.target.value})} />

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 12px" }}>
              <div>
                <label style={sLabel}>Telefono *</label>
                <input style={sInput} placeholder="Numero de telefono" value={form.telefono} onChange={e => setForm({...form, telefono:e.target.value})} />
              </div>
              <div>
                <label style={sLabel}>Zona</label>
                <input style={sInput} placeholder="Ej: Cali Norte" value={form.zona} onChange={e => setForm({...form, zona:e.target.value})} />
              </div>
            </div>

            <label style={sLabel}>{editing ? "Nueva Contrasena (vacio = sin cambio)" : "Contrasena *"}</label>
            <input style={sInput} type="password" placeholder="Minimo 6 caracteres" value={form.password} onChange={e => setForm({...form, password:e.target.value})} />

            {!editing && (
              <div style={{ background:"#fff7ed", border:"1px solid #fed7aa", borderRadius:"8px", padding:"10px 14px", marginBottom:"14px", fontSize:"12px", color:"#9a3412" }}>
                Guarda estas credenciales para entregarle al cobrador: correo + contrasena.
              </div>
            )}

            <div style={{ display:"flex", gap:"10px", marginTop:"8px" }}>
              <button style={{ flex:1, padding:"12px", border:"1.5px solid #e2e8f0", borderRadius:"8px", background:"#fff", fontSize:"14px", fontWeight:"600", cursor:"pointer", color:"#64748b" }} onClick={() => setShowModal(false)}>Cancelar</button>
              <button style={{ flex:1, padding:"12px", border:"none", borderRadius:"8px", background:"#16a34a", fontSize:"14px", fontWeight:"700", cursor:"pointer", color:"#fff" }} onClick={handleSave} disabled={saving}>{saving?"Guardando...":"Guardar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}