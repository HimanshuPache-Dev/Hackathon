import { calculateRiskScore } from '../../risk/calculator';
import { ExplainabilityService } from '../explainability.service';

describe('Explainability Service', () => {
  const explainabilityService = new ExplainabilityService();

  test('generates complete explanation', () => {
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
    const explanation = explainabilityService.generateExplanation(
      'Juni Pardi Naka Chowk',
      result
    );

    expect(explanation.score).toBe(73.2);
    expect(explanation.riskLevel).toBe('HIGH');
    expect(explanation.topFactors).toEqual(['A', 'C', 'V']);
    expect(explanation.summary).toContain('Juni Pardi Naka Chowk');
    expect(explanation.summary).toContain('HIGH');
    expect(explanation.summary).toContain('73.2');
  });

  test('summary includes top 3 factors', () => {
    const inputs = {
      accidentHistory: 1.0,
      congestion: 1.0,
      violations: 1.0,
      obstructions: 0.0,
      weather: 0.0,
      events: 0.0,
      incidents: 0.0,
    };

    const result = calculateRiskScore(inputs);
    const explanation = explainabilityService.generateExplanation(
      'Test Junction',
      result
    );

    expect(explanation.summary).toContain('historical severity');
    expect(explanation.summary).toContain('congestion');
    expect(explanation.summary).toContain('traffic violations');
  });

  test('generates comparison explanation', () => {
    const comparison = explainabilityService.generateComparisonExplanation(
      'Test Junction',
      60,
      80,
      'HIGH',
      'CRITICAL'
    );

    expect(comparison).toContain('increased');
    expect(comparison).toContain('20');
    expect(comparison).toContain('HIGH');
    expect(comparison).toContain('CRITICAL');
  });

  test('gets high impact factors', () => {
    const inputs = {
      accidentHistory: 0.85,
      congestion: 0.90,
      violations: 0.60,
      obstructions: 0.10,
      weather: 0.10,
      events: 0.10,
      incidents: 0.10,
    };

    const result = calculateRiskScore(inputs);
    const highImpact = explainabilityService.getHighImpactFactors(
      result.breakdown,
      10
    );

    expect(highImpact.length).toBe(3); // A, C, V
    expect(highImpact.map((f) => f.code)).toEqual(['A', 'C', 'V']);
  });
});