import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';
export const api = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });
api.interceptors.request.use((config) => { const token = localStorage.getItem('safeflow_token'); if (token) config.headers.Authorization = `Bearer ${token}`; return config; });
api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('safeflow_token');
    window.dispatchEvent(new CustomEvent('safeflow:auth-expired'));
  }
  return Promise.reject(error);
});
export const authAPI = { login: (email:string,password:string) => api.post('/auth/login',{email,password}), logout:()=>api.post('/auth/logout') };
export const junctionsAPI = { getAll:()=>api.get('/junctions'), getById:(id:string)=>api.get(`/junctions/${id}`) };
export const officersAPI = { getAll:()=>api.get('/officers'), getLocations:()=>api.get('/officers/locations') };
export const incidentsAPI = { getAll:()=>api.get('/incidents'), simulate:(data:{junction_id:string;severity:number;incident_type:string})=>api.post('/incidents/simulate',data), resolve:(id:string)=>api.post(`/incidents/${id}/resolve`) };
export const recommendationsAPI = { getAll:()=>api.get('/recommendations'), accept:(id:string)=>api.post(`/recommendations/${id}/accept`), reject:(id:string,reason:string)=>api.post(`/recommendations/${id}/reject`,{reason}), modify:(id:string,data:unknown)=>api.post(`/recommendations/${id}/modify`,data) };
export const baselineAPI = { getMetrics:()=>api.get('/baseline') };
export const decisionsAPI = { getAll:()=>api.get('/decisions') };
