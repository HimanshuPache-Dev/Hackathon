export interface Junction {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  current_risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  officer_count: number;
  historical_severity_score: number;
  congestion: number;
  violations: number;
  obstructions: number;
  weather_risk: number;
  event_pressure: number;
  incident_severity: number;
  updated_at: string;
}

export interface Officer {
  id: string;
  officer_id: string;
  name: string;
  status: 'AVAILABLE' | 'DEPLOYED' | 'BUSY' | 'OFFLINE';
  latitude: number;
  longitude: number;
  assigned_junction_id: string | null;
  is_demo: boolean;
  updated_at: string;
}

export interface Recommendation {
  id: string;
  junction_id: string;
  officer_id: string;
  travel_minutes: number;
  expected_risk_reduction: number;
  reasons: string[];
  deployment_priority: number;
  status: 'PENDING' | 'ACCEPTED' | 'MODIFIED' | 'REJECTED';
  created_at: string;
}

export interface Incident {
  id: string;
  junction_id: string;
  junction_name: string;
  type: string;
  severity: 'MINOR' | 'MAJOR' | 'SEVERE' | 'CRITICAL';
  severity_value: number;
  is_simulated: boolean;
  duration_minutes: number;
  created_at: string;
  expires_at: string;
  status: 'ACTIVE' | 'RESOLVED';
}

export interface BaselineMetrics {
  staticHighRiskCoverage: number;
  recommendedHighRiskCoverage: number;
  staticUnmannedCount: number;
  recommendedUnmannedCount: number;
  staticResponseTime: number;
  recommendedResponseTime: number;
  officerMovementCount: number;
}

export interface BaselineResponse {
  success: boolean;
  data: {
    metrics: BaselineMetrics;
    summary: string;
    source: string;
  };
}