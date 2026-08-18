/**
 * Explainability Service
 * 
 * Generates human-readable explanations for risk scores.
 * This is what makes PoliceOps "explainable AI" instead of a black box.
 */

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
  /**
   * Generate complete risk explanation
   */
  generateExplanation(
    junctionName: string,
    result: RiskCalculationResult
  ): RiskExplanation {
    // Sort factors by contribution (descending)
    const sortedFactors = [...result.breakdown].sort(
      (a, b) => b.contribution - a.contribution
    );

    // Get top 3 contributing factors
    const topFactors = sortedFactors.slice(0, 3).map((f) => f.code);

    // Generate plain-language summary
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

  /**
   * Generate plain-language summary
   * Example: "Juni Pardi Naka Chowk has a CRITICAL risk score of 87.3 
   * primarily due to high historical severity (25.5 points), severe 
   * congestion (22.5 points), and a newly reported incident (8.7 points)."
   */
  private generateSummary(
    junctionName: string,
    score: number,
    level: string,
    sortedFactors: RiskCalculationResult['breakdown']
  ): string {
    const top3 = sortedFactors.slice(0, 3);

    // Create factor descriptions with adjectives
    const factorDescriptions = top3.map((factor) => {
      const adjective = this.getAdjective(factor.value);
      const name = this.getDisplayName(factor.name);
      return `${adjective} ${name} (${factor.contribution.toFixed(1)} points)`;
    });

    // Join with commas and "and"
    const top3Text = this.joinFactors(factorDescriptions);

    return `${junctionName} has a ${level} risk score of ${score.toFixed(1)} primarily due to ${top3Text}.`;
  }

  /**
   * Get adjective based on factor value
   */
  private getAdjective(value: number): string {
    if (value >= 0.8) return 'very high';
    if (value >= 0.6) return 'high';
    if (value >= 0.4) return 'moderate';
    if (value >= 0.2) return 'low';
    return 'very low';
  }

  /**
   * Get display name for factor
   */
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

  /**
   * Join factor descriptions with proper grammar
   */
  private joinFactors(descriptions: string[]): string {
    if (descriptions.length === 0) return 'unknown factors';
    if (descriptions.length === 1) return descriptions[0];
    if (descriptions.length === 2) return descriptions.join(' and ');
    return descriptions.slice(0, -1).join(', ') + ', and ' + descriptions.slice(-1);
  }

  /**
   * Get factor details by code
   */
  getFactorByCode(
    breakdown: RiskCalculationResult['breakdown'],
    code: string
  ) {
    return breakdown.find((f) => f.code === code);
  }

  /**
   * Get all factors above a threshold
   */
  getHighImpactFactors(
    breakdown: RiskCalculationResult['breakdown'],
    threshold: number = 10
  ) {
    return breakdown.filter((f) => f.contribution >= threshold);
  }

  /**
   * Generate comparison explanation (before vs after)
   */
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
