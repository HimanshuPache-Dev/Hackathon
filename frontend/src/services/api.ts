import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Junctions API
export const junctionsAPI = {
  getAll: () => api.get('/junctions'),
  getById: (id: string) => api.get(`/junctions/${id}`),
};

// Officers API
export const officersAPI = {
  getAll: () => api.get('/officers'),
  getLocations: () => api.get('/officers/locations'),
  startDuty: (data: { officerId: string; latitude: number; longitude: number }) =>
    api.post('/officers/duty/start', data),
  updateLocation: (data: { officerId: string; latitude: number; longitude: number }) =>
    api.post('/officers/location', data),
  stopDuty: (data: { officerId: string }) => api.post('/officers/duty/stop', data),
  markArrival: (data: { officerId: string; junctionId: string }) =>
    api.post('/officers/arrival', data),
  reportIncident: (data: any) => api.post('/officers/report-incident', data),
};

// Incidents API
export const incidentsAPI = {
  simulate: (data: { junctionId: string; severity: string }) =>
    api.post('/incidents/simulate', data),
  resolve: (id: string) => api.post(`/incidents/${id}/resolve`),
  getActive: () => api.get('/incidents/active'),
};

// Recommendations API
export const recommendationsAPI = {
  getAll: () => api.get('/recommendations'),
  accept: (id: string) => api.post(`/recommendations/${id}/accept`),
  reject: (id: string, reason?: string) =>
    api.post(`/recommendations/${id}/reject`, { reason }),
  modify: (id: string, data: { newOfficerId: string; newJunctionId: string }) =>
    api.post(`/recommendations/${id}/modify`, data),
};

// Baseline API
export const baselineAPI = {
  getMetrics: () => api.get('/baseline'),
};

export default api;