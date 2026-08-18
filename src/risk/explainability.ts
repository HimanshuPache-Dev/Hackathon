import { RiskCalculationResult } from '../risk/calculator';

export interface RiskExplanation {
  factors: Array<{
    code: string;
    name: string;
    value: number;
    weight: number;
    contribution: number;
  }>;
  topFactors: string[];
  summary: string;
  riskLevel: string;
  score: number;
}

export class ExplainabilityService {
  generateExplanation(
    junctionName: string,
    result: RiskCalculationResult
  ): RiskExplanation {
    const sortedFactors = [...result.breakdown].sort(
      (a, b) => b.contribution - a.contribution
    );

    const topFactors = sortedFactors.slice(0, 3).map((f) => f.code);

    const summary = this.generateSummary(
      junctionName,
      result.score,
      result.level,
      sortedFactors
    );

    return {
      factors: result.breakdown,
      topFactors,
      summary,
      riskLevel: result.level,
      score: result.score,
    };
  }

  private generateSummary(
    junctionName: string,
    score: number,
    level: string,
    sortedFactors: RiskCalculationResult['breakdown']
  ): string {
    const top3 = sortedFactors.slice(0, 3);

    const factorDescriptions = top3.map((factor) => {
      const adjective = this.getAdjective(factor.value);
      const name = this.getDisplayName(factor.name);
      return `${adjective} ${name} (${factor.contribution.toFixed(1)} points)`;
    });

    const top3Text = this.joinFactors(factorDescriptions);

    return `${junctionName} has a ${level} risk score of ${score.toFixed(1)} primarily due to ${top3Text}.`;
  }

  private getAdjective(value: number): string {
    if (value >= 0.8) return 'very high';
    if (value >= 0.6) return 'high';
    if (value >= 0.4) return 'moderate';
    if (value >= 0.2) return 'low';
    return 'very low';
  }

  private getDisplayName(name: string): string {
    const nameMap: Record<string, string> = {
      'Accident History': 'historical severity',
      'Congestion': 'congestion',
      'Violations': 'traffic violations',
      'Obstructions': 'road obstructions',
      'Weather': 'weather conditions',
      'Events': 'event pressure',
      'Current Incident': 'current incident',
    };
    return nameMap[name] || name;
  }

  private joinFactors(descriptions: string[]): string {
    if (descriptions.length === 0) return 'unknown factors';
    if (descriptions.length === 1) return descriptions[0];
    if (descriptions.length === 2) return descriptions.join(' and ');
    return descriptions.slice(0, -1).join(', ') + ', and ' + descriptions.slice(-1);
  }

  getFactorByCode(
    breakdown: RiskCalculationResult['breakdown'],
    code: string
  ) {
    return breakdown.find((f) => f.code === code);
  }

  getHighImpactFactors(
    breakdown: RiskCalculationResult['breakdown'],
    threshold: number = 10
  ) {
    return breakdown.filter((f) => f.contribution >= threshold);
  }

  generateComparisonExplanation(
    junctionName: string,
    beforeScore: number,
    afterScore: number,
    beforeLevel: string,
    afterLevel: string
  ): string {
    const scoreChange = afterScore - beforeScore;
    const percentChange = ((scoreChange / beforeScore) * 100).toFixed(1);

    const direction = scoreChange > 0 ? 'increased' : 'decreased';
    const levelChange =
      beforeLevel !== afterLevel
        ? ` (risk level changed from ${beforeLevel} to ${afterLevel})`
        : '';

    return `${junctionName}'s risk score ${direction} by ${Math.abs(
      scoreChange
    ).toFixed(1)} points (${percentChange}%)${levelChange}.`;
  }
}