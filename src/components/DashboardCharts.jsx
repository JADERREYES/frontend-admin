import React, {useEffect,useState} from "react";
import axios from "axios";

import {
 Chart as ChartJS,
 CategoryScale,
 LinearScale,
 BarElement,
 LineElement,
 PointElement,
 Title,
 Tooltip,
 Legend
} from "chart.js";

import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
 CategoryScale,
 LinearScale,
 BarElement,
 LineElement,
 PointElement,
 Title,
 Tooltip,
 Legend
);

export default function DashboardCharts(){

 const [data,setData] = useState(null);

 const token = localStorage.getItem("admin_token");

 useEffect(()=>{

  axios.get("http://localhost:5000/api/dashboard-charts",{
   headers:{
    Authorization:`Bearer ${token}`
   }
  })
  .then(res=>setData(res.data))
  .catch(console.error);

 },[]);

 if(!data) return null;

 /* CARTERA POR SEDE */

 const carteraChart = {
  labels:data.carteraSede.map(c=>c.sede),
  datasets:[
   {
    label:"Cartera por sede",
    data:data.carteraSede.map(c=>c.total),
    backgroundColor:"#00ff88"
   }
  ]
 };

 /* COBROS DIARIOS */

 const pagosChart = {
  labels:data.pagos.map(p=>p._id),
  datasets:[
   {
    label:"Cobros diarios",
    data:data.pagos.map(p=>p.total),
    borderColor:"#00e5ff",
    backgroundColor:"rgba(0,229,255,0.2)"
   }
  ]
 };

 return(

 <div style={{
  marginTop:"30px",
  display:"grid",
  gridTemplateColumns:"1fr 1fr",
  gap:"20px"
 }}>

 <div style={{
  background:"#071a14",
  padding:"20px",
  borderRadius:"14px"
 }}>

 <h3 style={{color:"#00ff88"}}>
 Cartera por sede
 </h3>

 <Bar data={carteraChart} />

 </div>

 <div style={{
  background:"#071a14",
  padding:"20px",
  borderRadius:"14px"
 }}>

 <h3 style={{color:"#00ff88"}}>
 Cobros diarios
 </h3>

 <Line data={pagosChart} />

 </div>

 <div style={{
  background:"#071a14",
  padding:"20px",
  borderRadius:"14px"
 }}>

 <h3 style={{color:"#00ff88"}}>
 Préstamos activos
 </h3>

 <h1 style={{fontSize:"40px"}}>
 {data.prestamosActivos}
 </h1>

 </div>

 </div>

 );

}