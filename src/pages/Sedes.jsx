import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Sedes(){

  const [sedes,setSedes] = useState([]);
  const [cobradores,setCobradores] = useState([]);

  const [nombre,setNombre] = useState("");
  const [direccion,setDireccion] = useState("");

  const token = localStorage.getItem("admin_token");

  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers:{
      Authorization:`Bearer ${token}`
    }
  });

  useEffect(()=>{
    cargarSedes();
    cargarCobradores();
  },[]);

  async function cargarSedes(){

    try{

      const res = await api.get("/sedes");
      setSedes(res.data);

    }catch(err){

      console.error(err);

    }

  }

  async function cargarCobradores(){

    try{

      const res = await api.get("/cobradores");
      setCobradores(res.data);

    }catch(err){

      console.error(err);

    }

  }

  async function crearSede(){

    if(!nombre) return alert("Nombre requerido");

    try{

      await api.post("/sedes",{
        nombre,
        direccion
      });

      setNombre("");
      setDireccion("");

      cargarSedes();

    }catch(err){

      alert("Error creando sede");

    }

  }

  async function eliminarSede(id){

    if(!window.confirm("Eliminar sede?")) return;

    try{

      await api.delete(`/sedes/${id}`);

      cargarSedes();

    }catch(err){

      alert("Error eliminando sede");

    }

  }

  return(

  <div style={{padding:"25px"}}>

    <h2 style={{marginBottom:"20px"}}>Gestión de Sedes</h2>

    <div style={{
      background:"#0b1e19",
      padding:"20px",
      borderRadius:"10px",
      marginBottom:"25px"
    }}>

      <h3>Crear Sede</h3>

      <input
        placeholder="Nombre sede"
        value={nombre}
        onChange={e=>setNombre(e.target.value)}
        style={{marginRight:"10px",padding:"8px"}}
      />

      <input
        placeholder="Dirección"
        value={direccion}
        onChange={e=>setDireccion(e.target.value)}
        style={{marginRight:"10px",padding:"8px"}}
      />

      <button
        onClick={crearSede}
        style={{
          padding:"8px 14px",
          background:"#00ff88",
          border:"none",
          cursor:"pointer"
        }}
      >
        Crear
      </button>

    </div>

    <div style={{
      background:"#0b1e19",
      padding:"20px",
      borderRadius:"10px"
    }}>

      <h3>Listado de Sedes</h3>

      <table style={{
        width:"100%",
        borderCollapse:"collapse",
        marginTop:"15px"
      }}>

        <thead>

          <tr style={{background:"#021a14"}}>

            <th style={th}>Nombre</th>
            <th style={th}>Dirección</th>
            <th style={th}>Cobradores</th>
            <th style={th}>Acciones</th>

          </tr>

        </thead>

        <tbody>

          {sedes.map(sede=>{

            const cobradoresSede = cobradores.filter(
              c=>c.sedeId === sede._id
            );

            return(

              <tr key={sede._id} style={{borderBottom:"1px solid #0f3c2f"}}>

                <td style={td}>{sede.nombre}</td>

                <td style={td}>{sede.direccion || "-"}</td>

                <td style={td}>

                  {cobradoresSede.length === 0 && "Sin cobradores"}

                  {cobradoresSede.map(c=>(
                    <div key={c._id}>{c.nombre}</div>
                  ))}

                </td>

                <td style={td}>

                  <button
                    onClick={()=>eliminarSede(sede._id)}
                    style={{
                      background:"#ff4466",
                      border:"none",
                      padding:"6px 10px",
                      cursor:"pointer"
                    }}
                  >
                    Eliminar
                  </button>

                </td>

              </tr>

            );

          })}

        </tbody>

      </table>

    </div>

  </div>

  );

}

const th={
  padding:"10px",
  textAlign:"left",
  color:"#00ff88"
}

const td={
  padding:"10px"
}