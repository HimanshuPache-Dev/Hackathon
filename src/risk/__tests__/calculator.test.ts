import { calculateRiskScore, determineRiskLevel, normalizeHistoricalScore } from '../calculator';

describe('Risk Calculator', () => {
  test('calculates correct score', () => {
    const inputs = {
      accidentHistory: 0.85,
      congestion: 0.90,
      violations: 0.60,
      obstructions: 0.40,
      weather: 0.40,
      events: 0.30,
      incidents: 0.87,
    };

    const result = calculateRiskScore(inputs);

    expect(result.score).toBe(73.2);
    expect(result.level).toBe('HIGH');
  });

  test('determines CRITICAL level', () => {
    expect(determineRiskLevel(85)).toBe('CRITICAL');
  });

  test('normalizes historical score', () => {
    expect(normalizeHistoricalScore(85)).toBe(0.85);
  });
});