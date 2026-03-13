// @ts-nocheck
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para logs de peticiones
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ===== SERVICIOS DE VENTANILLAS =====
export const windowsAPI = {
  // Obtener todas las ventanillas
  getAll: () => api.get('/windows'),

  // Obtener ventanillas activas (para pantalla pública)
  getActive: () => api.get('/windows/active'),

  // Obtener una ventanilla por ID
  getById: (id) => api.get(`/windows/${id}`),

  // Llamar siguiente turno
  callNext: (id) => api.post(`/windows/${id}/call-next`),

  // Re-llamar turno actual
  reCall: (id) => api.post(`/windows/${id}/recall`),

  // Actualizar anuncio
  updateAnnouncement: (id, anuncio) =>
    api.patch(`/windows/${id}/announcement`, { anuncio }),

  // Limpiar ventanilla
  clear: (id) => api.delete(`/windows/${id}/clear`),

  // Reiniciar contador de ventanilla
  resetCounter: (id) => api.post(`/windows/${id}/reset-counter`),

  // Crear ventanilla
  create: (data) => api.post('/windows', data),

  // Eliminar ventanilla
  delete: (id) => api.delete(`/windows/${id}`),

  // Activar / Desactivar ventanilla
  toggleActive: (id) => api.patch(`/windows/${id}/toggle`),
};

// ===== SERVICIOS DE COLA =====

export const queueAPI = {
  getStatus: () => api.get('/windows/queue/status'),
  reset: () => api.post('/windows/queue/reset'),
};
export default api;