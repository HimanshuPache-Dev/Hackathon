/**
 * ==========================================================
 * SIMULATED TRAFFIC INPUT DATA
 * ----------------------------------------------------------
 * These values are NOT real-time measurements.
 * They are simulated for testing, demonstrations,
 * UI development, and deployment validation.
 *
 * Value Range:
 * 0.0 = None
 * 0.2 = Very Low
 * 0.4 = Low
 * 0.6 = Moderate
 * 0.8 = High
 * 1.0 = Very High
 * ==========================================================
 */

export interface ScenarioInput {
  congestion: number;
  violations: number;
  obstruction: number;
  weather: number;
  event: number;
  currentIncident: number;
  officerCoverage: number;
}

export const scenarioInputs: Record<string, ScenarioInput> = {
  // =========================
  // SIMULATED DATA
  // =========================

  J001: {
    congestion: 0.90,
    violations: 0.80,
    obstruction: 0.30,
    weather: 0.20,
    event: 0.50,
    currentIncident: 0.60,
    officerCoverage: 0.80,
  },

  J002: {
    congestion: 0.95,
    violations: 0.70,
    obstruction: 0.40,
    weather: 0.30,
    event: 0.20,
    currentIncident: 0.10,
    officerCoverage: 0.60,
  },

  J003: {
    congestion: 0.85,
    violations: 0.75,
    obstruction: 0.20,
    weather: 0.40,
    event: 0.60,
    currentIncident: 0.40,
    officerCoverage: 0.70,
  },

  J004: {
    congestion: 0.80,
    violations: 0.65,
    obstruction: 0.50,
    weather: 0.30,
    event: 0.10,
    currentIncident: 0.20,
    officerCoverage: 0.50,
  },

  J005: {
    congestion: 0.88,
    violations: 0.70,
    obstruction: 0.40,
    weather: 0.20,
    event: 0.30,
    currentIncident: 0.30,
    officerCoverage: 0.60,
  },

  J006: {
    congestion: 0.75,
    violations: 0.60,
    obstruction: 0.30,
    weather: 0.40,
    event: 0.20,
    currentIncident: 0.10,
    officerCoverage: 0.70,
  },

  J007: {
    congestion: 0.70,
    violations: 0.55,
    obstruction: 0.20,
    weather: 0.30,
    event: 0.40,
    currentIncident: 0.00,
    officerCoverage: 0.80,
  },

  J008: {
    congestion: 0.72,
    violations: 0.60,
    obstruction: 0.25,
    weather: 0.30,
    event: 0.10,
    currentIncident: 0.20,
    officerCoverage: 0.50,
  },

  J009: {
    congestion: 0.68,
    violations: 0.50,
    obstruction: 0.35,
    weather: 0.40,
    event: 0.10,
    currentIncident: 0.10,
    officerCoverage: 0.60,
  },

  J010: {
    congestion: 0.82,
    violations: 0.65,
    obstruction: 0.20,
    weather: 0.20,
    event: 0.40,
    currentIncident: 0.30,
    officerCoverage: 0.70,
  },

  J011: {
    congestion: 0.60,
    violations: 0.45,
    obstruction: 0.30,
    weather: 0.50,
    event: 0.20,
    currentIncident: 0.10,
    officerCoverage: 0.90,
  },

  J012: {
    congestion: 0.65,
    violations: 0.50,
    obstruction: 0.40,
    weather: 0.60,
    event: 0.30,
    currentIncident: 0.00,
    officerCoverage: 0.60,
  },

  J013: {
    congestion: 0.55,
    violations: 0.45,
    obstruction: 0.20,
    weather: 0.30,
    event: 0.10,
    currentIncident: 0.10,
    officerCoverage: 0.80,
  },

  J014: {
    congestion: 0.62,
    violations: 0.48,
    obstruction: 0.35,
    weather: 0.40,
    event: 0.20,
    currentIncident: 0.20,
    officerCoverage: 0.70,
  },

  J015: {
    congestion: 0.58,
    violations: 0.42,
    obstruction: 0.15,
    weather: 0.30,
    event: 0.20,
    currentIncident: 0.10,
    officerCoverage: 0.60,
  },

  J016: {
    congestion: 0.66,
    violations: 0.55,
    obstruction: 0.30,
    weather: 0.40,
    event: 0.30,
    currentIncident: 0.20,
    officerCoverage: 0.50,
  },

  J017: {
    congestion: 0.52,
    violations: 0.40,
    obstruction: 0.20,
    weather: 0.30,
    event: 0.10,
    currentIncident: 0.00,
    officerCoverage: 0.70,
  },

  J018: {
    congestion: 0.78,
    violations: 0.65,
    obstruction: 0.50,
    weather: 0.50,
    event: 0.40,
    currentIncident: 0.50,
    officerCoverage: 0.60,
  },

  J019: {
    congestion: 0.70,
    violations: 0.58,
    obstruction: 0.35,
    weather: 0.20,
    event: 0.20,
    currentIncident: 0.10,
    officerCoverage: 0.80,
  },

  J020: {
    congestion: 0.74,
    violations: 0.55,
    obstruction: 0.30,
    weather: 0.40,
    event: 0.10,
    currentIncident: 0.20,
    officerCoverage: 0.70,
  },
};
