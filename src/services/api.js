import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/admin/login', { email, password }),
};

export const dashboardAPI = {
  get: () => api.get('/dashboard'),
};

export const cobradoresAPI = {
  getAll: (search) => api.get('/cobradores', { params: { search } }),
  create: (data) => api.post('/cobradores', data),
  update: (id, data) => api.put(`/cobradores/${id}`, data),
  delete: (id) => api.delete(`/cobradores/${id}`),
};

export const clientesAPI = {
  getAll: (search) => api.get('/clientes', { params: { search } }),
  create: (data) => api.post('/clientes', data),
  update: (id, data) => api.put(`/clientes/${id}`, data),
  delete: (id) => api.delete(`/clientes/${id}`),
};

export const prestamosAPI = {
  getAll: (params) => api.get('/prestamos', { params }),
  create: (data) => api.post('/prestamos', data),
  registrarPago: (data) => api.post('/pagos', data),
};

export const inventarioAPI = {
  getAll: (params) => api.get('/inventario', { params }),
  create: (data) => api.post('/inventario', data),
  update: (id, data) => api.put(`/inventario/${id}`, data),
  delete: (id) => api.delete(`/inventario/${id}`),
};

export default api;
