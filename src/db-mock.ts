import { Pool } from 'pg';

// All 20 junctions with realistic risk scores
const mockJunctions = [
  { id: 'J001', name: 'Chhatrapati Square', latitude: 21.1456, longitude: 79.0876, current_risk_score: 52.3, risk_level: 'MEDIUM', officer_count: 1, historical_severity_score: 65, congestion: 0.4, violations: 0.3, obstructions: 0.2, weather_risk: 0.3, event_pressure: 0.1, incident_severity: 0.0, updated_at: new Date().toISOString() },
  { id: 'J002', name: 'Juni Pardi Naka Chowk', latitude: 21.15139, longitude: 79.14889, current_risk_score: 58.3, risk_level: 'MEDIUM', officer_count: 0, historical_severity_score: 81, congestion: 0.5, violations: 0.3, obstructions: 0.2, weather_risk: 0.4, event_pressure: 0.2, incident_severity: 0.0, updated_at: new Date().toISOString() },
  { id: 'J003', name: 'Jhansi Rani Square', latitude: 21.1482, longitude: 79.0831, current_risk_score: 62.7, risk_level: 'HIGH', officer_count: 1, historical_severity_score: 72, congestion: 0.6, violations: 0.4, obstructions: 0.3, weather_risk: 0.3, event_pressure: 0.2, incident_severity: 0.0, updated_at: new Date().toISOString() },
  { id: 'J004', name: 'Chikli Square', latitude: 21.1623, longitude: 79.14106, current_risk_score: 68.2, risk_level: 'HIGH', officer_count: 0, historical_severity_score: 88, congestion: 0.7, violations: 0.5, obstructions: 0.4, weather_risk: 0.3, event_pressure: 0.2, incident_severity: 0.0, updated_at: new Date().toISOString() },
  { id: 'J005', name: 'Maruti Seva Square, Kamptee Road', latitude: 21.1789, longitude: 79.1523, current_risk_score: 55.1, risk_level: 'MEDIUM', officer_count: 1, historical_severity_score: 70, congestion: 0.5, violations: 0.4, obstructions: 0.3, weather_risk: 0.3, event_pressure: 0.1, incident_severity: 0.0, updated_at: new Date().toISOString() },
  { id: 'J006', name: 'Ravi Nagar', latitude: 21.1567, longitude: 79.1234, current_risk_score: 48.9, risk_level: 'MEDIUM', officer_count: 1, historical_severity_score: 62, congestion: 0.4, violations: 0.3, obstructions: 0.2, weather_risk: 0.3, event_pressure: 0.1, incident_severity: 0.0, updated_at: new Date().toISOString() },
  { id: 'J007', name: 'Shitla Mata Square', latitude: 21.1389, longitude: 79.1156, current_risk_score: 51.4, risk_level: 'MEDIUM', officer_count: 1, historical_severity_score: 68, congestion: 0.5, violations: 0.3, obstructions: 0.3, weather_risk: 0.3, event_pressure: 0.2, incident_severity: 0.0, updated_at: new Date().toISOString() },
  { id: 'J008', name: 'Gandhi Bagh', latitude: 21.1423, longitude: 79.0912, current_risk_score: 71.8, risk_level: 'HIGH', officer_count: 0, historical_severity_score: 85, congestion: 0.8, violations: 0.6, obstructions: 0.5, weather_risk: 0.3, event_pressure: 0.3, incident_severity: 0.0, updated_at: new Date().toISOString() },
  { id: 'J009', name: 'Lakadganj', latitude: 21.1345, longitude: 79.0789, current_risk_score: 76.3, risk_level: 'HIGH', officer_count: 0, historical_severity_score: 90, congestion: 0.9, violations: 0.7, obstructions: 0.6, weather_risk: 0.4, event_pressure: 0.3, incident_severity: 0.0, updated_at: new Date().toISOString() },
  { id: 'J010', name: 'Itwari', latitude: 21.1512, longitude: 79.0678, current_risk_score: 59.6, risk_level: 'MEDIUM', officer_count: 0, historical_severity_score: 75, congestion: 0.6, violations: 0.5, obstructions: 0.4, weather_risk: 0.3, event_pressure: 0.2, incident_severity: 0.0, updated_at: new Date().toISOString() },
  { id: 'J011', name: 'Sitabuldi', latitude: 21.1467, longitude: 79.0845, current_risk_score: 85.2, risk_level: 'CRITICAL', officer_count: 0, historical_severity_score: 95, congestion: 0.9, violations: 0.8, obstructions: 0.7, weather_risk: 0.4, event_pressure: 0.4, incident_severity: 0.0, updated_at: new Date().toISOString() },
  { id: 'J012', name: 'Dharampeth', latitude: 21.1289, longitude: 79.0534, current_risk_score: 44.5, risk_level: 'MEDIUM', officer_count: 0, historical_severity_score: 58, congestion: 0.4, violations: 0.3, obstructions: 0.2, weather_risk: 0.3, event_pressure: 0.1, incident_severity: 0.0, updated_at: new Date().toISOString() },
  { id: 'J013', name: 'Shankar Nagar', latitude: 21.1234, longitude: 79.0623, current_risk_score: 49.8, risk_level: 'MEDIUM', officer_count: 0, historical_severity_score: 64, congestion: 0.5, violations: 0.4, obstructions: 0.3, weather_risk: 0.3, event_pressure: 0.2, incident_severity: 0.0, updated_at: new Date().toISOString() },
  { id: 'J014', name: 'Pratap Nagar', latitude: 21.1178, longitude: 79.0712, current_risk_score: 53.2, risk_level: 'MEDIUM', officer_count: 0, historical_severity_score: 67, congestion: 0.5, violations: 0.4, obstructions: 0.3, weather_risk: 0.3, event_pressure: 0.2, incident_severity: 0.0, updated_at: new Date().toISOString() },
  { id: 'J015', name: 'Manish Nagar', latitude: 21.1089, longitude: 79.0801, current_risk_score: 47.6, risk_level: 'MEDIUM', officer_count: 0, historical_severity_score: 61, congestion: 0.4, violations: 0.3, obstructions: 0.3, weather_risk: 0.3, event_pressure: 0.1, incident_severity: 0.0, updated_at: new Date().toISOString() },
  { id: 'J016', name: 'Khamla', latitude: 21.1678, longitude: 79.0534, current_risk_score: 66.4, risk_level: 'HIGH', officer_count: 0, historical_severity_score: 78, congestion: 0.6, violations: 0.5, obstructions: 0.4, weather_risk: 0.3, event_pressure: 0.2, incident_severity: 0.0, updated_at: new Date().toISOString() },
  { id: 'J017', name: 'Wadi', latitude: 21.1789, longitude: 79.0423, current_risk_score: 56.9, risk_level: 'MEDIUM', officer_count: 0, historical_severity_score: 71, congestion: 0.5, violations: 0.4, obstructions: 0.4, weather_risk: 0.3, event_pressure: 0.2, incident_severity: 0.0, updated_at: new Date().toISOString() },
  { id: 'J018', name: 'Koradi', latitude: 21.1901, longitude: 79.0312, current_risk_score: 51.7, risk_level: 'MEDIUM', officer_count: 0, historical_severity_score: 66, congestion: 0.5, violations: 0.4, obstructions: 0.3, weather_risk: 0.3, event_pressure: 0.1, incident_severity: 0.0, updated_at: new Date().toISOString() },
  { id: 'J019', name: 'Godhani', latitude: 21.2012, longitude: 79.0201, current_risk_score: 45.3, risk_level: 'MEDIUM', officer_count: 0, historical_severity_score: 59, congestion: 0.4, violations: 0.3, obstructions: 0.3, weather_risk: 0.3, event_pressure: 0.1, incident_severity: 0.0, updated_at: new Date().toISOString() },
  { id: 'J020', name: 'Bokara', latitude: 21.2123, longitude: 79.0090, current_risk_score: 42.1, risk_level: 'MEDIUM', officer_count: 0, historical_severity_score: 55, congestion: 0.4, violations: 0.3, obstructions: 0.2, weather_risk: 0.3, event_pressure: 0.1, incident_severity: 0.0, updated_at: new Date().toISOString() },
];

// All 10 fictional officers
const mockOfficers = [
  { id: 'off-01', officer_id: '01', name: 'Officer 01', status: 'DEPLOYED', latitude: 21.1456, longitude: 79.0876, assigned_junction_id: 'J001', is_demo: true, updated_at: new Date().toISOString() },
  { id: 'off-02', officer_id: '02', name: 'Officer 02', status: 'DEPLOYED', latitude: 21.1482, longitude: 79.0831, assigned_junction_id: 'J003', is_demo: true, updated_at: new Date().toISOString() },
  { id: 'off-03', officer_id: '03', name: 'Officer 03', status: 'DEPLOYED', latitude: 21.1623, longitude: 79.14106, assigned_junction_id: 'J004', is_demo: true, updated_at: new Date().toISOString() },
  { id: 'off-04', officer_id: '04', name: 'Officer 04', status: 'DEPLOYED', latitude: 21.1789, longitude: 79.1523, assigned_junction_id: 'J005', is_demo: true, updated_at: new Date().toISOString() },
  { id: 'off-05', officer_id: '05', name: 'Officer 05', status: 'DEPLOYED', latitude: 21.1567, longitude: 79.1234, assigned_junction_id: 'J006', is_demo: true, updated_at: new Date().toISOString() },
  { id: 'off-06', officer_id: '06', name: 'Officer 06', status: 'DEPLOYED', latitude: 21.1389, longitude: 79.1156, assigned_junction_id: 'J007', is_demo: true, updated_at: new Date().toISOString() },
  { id: 'off-07', officer_id: '07', name: 'Officer 07', status: 'AVAILABLE', latitude: 21.1500, longitude: 79.0900, assigned_junction_id: null, is_demo: true, updated_at: new Date().toISOString() },
  { id: 'off-08', officer_id: '08', name: 'Officer 08', status: 'AVAILABLE', latitude: 21.1600, longitude: 79.1000, assigned_junction_id: null, is_demo: true, updated_at: new Date().toISOString() },
  { id: 'off-09', officer_id: '09', name: 'Officer 09', status: 'BUSY', latitude: 21.1700, longitude: 79.1100, assigned_junction_id: null, is_demo: true, updated_at: new Date().toISOString() },
  { id: 'off-10', officer_id: '10', name: 'Officer 10', status: 'BUSY', latitude: 21.1800, longitude: 79.1200, assigned_junction_id: null, is_demo: true, updated_at: new Date().toISOString() },
];

export const db = {
  query: async (text: string, params?: any[]) => {
    console.log('DB Query:', text.substring(0, 80));

    if (text.includes('FROM junctions') && !text.includes('WHERE')) {
      return { rows: mockJunctions };
    }
    if (text.includes('FROM junctions') && text.includes('WHERE id =')) {
      const junctionId = params?.[0];
      const junction = mockJunctions.find(j => j.id === junctionId);
      return { rows: junction ? [junction] : [] };
    }
    if (text.includes('FROM officers')) {
      return { rows: mockOfficers };
    }
    if (text.includes('FROM recommendations')) {
      return { rows: [] };
    }
    if (text.includes('FROM incidents')) {
      return { rows: [] };
    }
    if (text.includes('SELECT 1')) {
      return { rows: [{ '1': 1 }] };
    }
    return { rows: [] };
  },
} as unknown as Pool;

export default db;