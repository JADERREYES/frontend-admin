import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import DashboardCharts from "../components/DashboardCharts";

const fmt = n => `$ ${Number(n || 0).toLocaleString('es-CO')}`;

export default function Dashboard(){

const [data,setData] = useState(null);
const [loading,setLoading] = useState(true);

useEffect(()=>{

 dashboardAPI.get()
  .then(r=>setData(r.data))
  .finally(()=>setLoading(false));

},[]);

if(loading){
 return <div style={{padding:"40px"}}>Cargando dashboard...</div>;
}

if(!data) return null;

const { stats, ultimosPrestamos, cobradoresRecientes, metricasSede } = data;

return(

<div style={{padding:"30px"}}>

<h2>Dashboard</h2>

<h3>Resumen</h3>

<div>

<p>Cobradores: {stats.cobradores}</p>
<p>Clientes: {stats.clientes}</p>
<p>Cartera Total: {fmt(stats.carteraTotal)}</p>
<p>Total Recaudado: {fmt(stats.totalRecaudado)}</p>
<p>Por Cobrar: {fmt(stats.porCobrar)}</p>
<p>Préstamos Activos: {stats.prestamosActivos}</p>

</div>

<hr/>

<h3>Dashboard por Sede</h3>

{metricasSede?.length === 0 && (
<p>No hay sedes registradas</p>
)}

{metricasSede?.map((s,i)=>(

<div key={i} style={{
 border:"1px solid #ddd",
 padding:"15px",
 marginBottom:"10px"
}}>

<h4>{s.sede}</h4>

<p>Clientes: {s.clientes}</p>
<p>Préstamos activos: {s.prestamos}</p>
<p>Cobros hoy: {fmt(s.cobrosHoy)}</p>

</div>

))}

<hr/>

<h3>Últimos préstamos</h3>

{ultimosPrestamos?.slice(0,5).map(p=>(

<div key={p._id}>
{p.cliente} - {fmt(p.totalAPagar)}
</div>

))}

<hr/>

<h3>Cobradores recientes</h3>

{cobradoresRecientes?.map(c=>(

<div key={c._id}>
{c.nombre} - {c.telefono}
</div>

))}

</div>

);

}