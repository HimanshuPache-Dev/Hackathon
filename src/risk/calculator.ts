// Remove the import
// import { RiskLevel } from '../../shared/types';

// Add inline type
type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface RiskInputs {
  accidentHistory: number;
  congestion: number;
  violations: number;
  obstructions: number;
  weather: number;
  events: number;
  incidents: number;
}

export interface RiskCalculationResult {
  score: number;
  level: RiskLevel;
  breakdown: Array<{
    code: string;
    name: string;
    value: number;
    weight: number;
    contribution: number;
  }>;
}

/**
 * Calculate risk score for a junction
 * @param inputs - Risk factor inputs (all normalized to 0-1)
 * @returns Risk score (0-100), level, and factor breakdown
 */
export function calculateRiskScore(inputs: RiskInputs): RiskCalculationResult {
  const normalized: RiskInputs = Object.fromEntries(
    Object.entries(inputs).map(([key, value]) => [key, Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0]),
  ) as unknown as RiskInputs;
  // Weights from the workbook
  const WEIGHTS = {
    accidentHistory: 0.30,
    congestion: 0.25,
    violations: 0.15,
    obstructions: 0.10,
    weather: 0.05,
    events: 0.05,
    incidents: 0.10,
  };

  // Calculate weighted contributions
  const contributions = {
    accidentHistory: normalized.accidentHistory * WEIGHTS.accidentHistory * 100,
    congestion: normalized.congestion * WEIGHTS.congestion * 100,
    violations: normalized.violations * WEIGHTS.violations * 100,
    obstructions: normalized.obstructions * WEIGHTS.obstructions * 100,
    weather: normalized.weather * WEIGHTS.weather * 100,
    events: normalized.events * WEIGHTS.events * 100,
    incidents: normalized.incidents * WEIGHTS.incidents * 100,
  };

  // Sum all contributions
  const rawScore =
    contributions.accidentHistory +
    contributions.congestion +
    contributions.violations +
    contributions.obstructions +
    contributions.weather +
    contributions.events +
    contributions.incidents;

  // Clamp score to 0-100 range
  const score = Math.min(100, Math.max(0, rawScore));

  // Determine risk level
  const level = determineRiskLevel(score);

  // Create breakdown for explainability
  const breakdown = [
  {
    code: 'A',  // ✅ CORRECT
    name: 'Accident History',
    value: normalized.accidentHistory,
    weight: WEIGHTS.accidentHistory,
    contribution: contributions.accidentHistory,
  },
  {
    code: 'C',
    name: 'Congestion',
    value: normalized.congestion,
    weight: WEIGHTS.congestion,
    contribution: contributions.congestion,
  },
  {
    code: 'V',
    name: 'Violations',
    value: normalized.violations,
    weight: WEIGHTS.violations,
    contribution: contributions.violations,
  },
  {
    code: 'O',
    name: 'Obstructions',
    value: normalized.obstructions,
    weight: WEIGHTS.obstructions,
    contribution: contributions.obstructions,
  },
  {
    code: 'W',
    name: 'Weather',
    value: normalized.weather,
    weight: WEIGHTS.weather,
    contribution: contributions.weather,
  },
  {
    code: 'E',
    name: 'Events',
    value: normalized.events,
    weight: WEIGHTS.events,
    contribution: contributions.events,
  },
  {
    code: 'I',
    name: 'Current Incident',
    value: normalized.incidents,
    weight: WEIGHTS.incidents,
    contribution: contributions.incidents,
  },
];

  return {
    score: Math.round(score * 10) / 10, // Round to 1 decimal place
    level,
    breakdown,
  };
}

/**
 * Determine risk level based on score
 * @param score - Risk score (0-100)
 * @returns Risk level (CRITICAL, HIGH, MEDIUM, LOW)
 */
export function determineRiskLevel(score: number): RiskLevel {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 35) return 'MEDIUM';
  return 'LOW';
}

/**
 * Normalize historical severity score to 0-1 range
 * @param historicalScore - Score from 0-100
 * @returns Normalized value 0-1
 */
export function normalizeHistoricalScore(historicalScore: number): number {
  return Math.min(1, Math.max(0, historicalScore / 100));
}
