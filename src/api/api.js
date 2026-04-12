import axios from 'axios';

// CORREGIDO: Usar process.env.REACT_APP_API_URL para Create React App
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('📡 API URL Configurada:', API_URL);

const api = axios.create({ 
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para inyectar token. El tenant real lo deriva el backend desde el JWT.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(`🚀 Petición: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para respuestas
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Respuesta: ${response.status} ${response.config.url}`);
    return response;
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/';
    }
    console.error(`❌ Error: ${err.response?.status} ${err.config?.url}`);
    return Promise.reject(err);
  }
);

// ===== SERVICIOS DE AUTENTICACIÓN =====
export const authAPI = {
  login: (email, password) => api.post('/auth/admin/login', { email, password }),
  logout: () => api.post('/auth/logout')
};

// ===== SERVICIOS DE DASHBOARD =====
export const dashboardAPI = {
  get: () => api.get('/dashboard'),
  getStats: () => api.get('/dashboard/stats'),
  getCharts: () => api.get('/dashboard/charts')
};

// ===== SERVICIOS DE COBRADORES =====
export const cobradoresAPI = {
  getAll: (search) => api.get('/cobradores', { params: { search } }),
  getById: (id) => api.get(`/cobradores/${id}`),
  create: (data) => api.post('/cobradores', data),
  update: (id, data) => api.put(`/cobradores/${id}`, data),
  delete: (id) => api.delete(`/cobradores/${id}`)
};

// ===== SERVICIOS DE CLIENTES =====
export const clientesAPI = {
  getAll: (search) => api.get('/clientes', { params: { search } }),
  getById: (id) => api.get(`/clientes/${id}`),
  create: (data) => api.post('/clientes', data),
  update: (id, data) => api.put(`/clientes/${id}`, data),
  delete: (id) => api.delete(`/clientes/${id}`)
};

// ===== SERVICIOS DE PRÉSTAMOS =====
export const prestamosAPI = {
  getAll: (params) => api.get('/prestamos', { params }),
  getById: (id) => api.get(`/prestamos/${id}`),
  create: (data) => api.post('/prestamos', data),
  update: (id, data) => api.put(`/prestamos/${id}`, data),
  delete: (id) => api.delete(`/prestamos/${id}`),
  getByCliente: (clienteId) => api.get(`/prestamos/cliente/${clienteId}`),
  registrarPago: (data) => api.post('/pagos', data)
};

// ===== SERVICIOS DE PAGOS =====
export const pagosAPI = {
  create: (prestamoId, data) => api.post(`/pagos/${prestamoId}`, data),
  getByPrestamo: (prestamoId) => api.get(`/pagos/prestamo/${prestamoId}`),
  getHoy: () => api.get('/pagos/hoy')
};

// ===== SERVICIOS DE INVENTARIO =====
export const inventarioAPI = {
  getAll: (params) => api.get('/inventario', { params }),
  getById: (id) => api.get(`/inventario/${id}`),
  create: (data) => api.post('/inventario', data),
  update: (id, data) => api.put(`/inventario/${id}`, data),
  delete: (id) => api.delete(`/inventario/${id}`),
  getStats: () => api.get('/inventario/stats/resumen'),
  getResumen: () => api.get('/inventario/resumen')
};

// ===== SERVICIOS DE CARTERA =====
export const carteraAPI = {
  getResumen: () => api.get('/cartera'),
  getPrestamos: () => api.get('/cartera/prestamos'),
  getPorCobrador: () => api.get('/cartera/cobradores'),
  getEstadisticas: () => api.get('/cartera/estadisticas'),
  getPagosResumen: () => api.get('/cartera/pagos/resumen')
};

// ===== SERVICIOS DE REPORTES =====
export const reportesAPI = {
  getDiario: (fecha) => api.get(`/reportes/diario?fecha=${fecha}`),
  getMensual: (mes, año) => api.get(`/reportes/mensual?mes=${mes}&año=${año}`),
  getPrestamos: () => api.get('/reportes/prestamos'),
  getClientes: () => api.get('/reportes/clientes'),
  getCobradores: () => api.get('/reportes/cobradores')
};

// ===== SERVICIOS DE SEDES =====
export const sedesAPI = {
  getAll: () => api.get('/sedes'),
  getById: (id) => api.get(`/sedes/${id}`),
  create: (data) => api.post('/sedes', data),
  update: (id, data) => api.put(`/sedes/${id}`, data),
  delete: (id) => api.delete(`/sedes/${id}`)
};

// ===== SERVICIOS DE CALENDARIO =====
export const calendarioAPI = {
  getEventos: (fecha) => api.get(`/calendario?fecha=${fecha}`),
  createEvento: (data) => api.post('/calendario', data),
  updateEvento: (id, data) => api.put(`/calendario/${id}`, data),
  deleteEvento: (id) => api.delete(`/calendario/${id}`)
};

// Exportación por defecto para usar api.get directamente
// ===== SERVICIOS DE OFICINA =====
export const oficinaAPI = {
  getEstadoMensualidad: () => api.get('/oficina/mensualidad/estado'),
  getNotificaciones: () => api.get('/oficina/notificaciones'),
  marcarNotificacionLeida: (id) => api.patch(`/oficina/notificaciones/${id}/leida`)
};

export default api;
