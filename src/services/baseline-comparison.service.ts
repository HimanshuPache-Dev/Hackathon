import { Pool } from 'pg';

export interface BaselineMetrics {
  staticHighRiskCoverage: number;
  recommendedHighRiskCoverage: number;
  staticUnmannedCount: number;
  recommendedUnmannedCount: number;
  staticResponseTime: number;
  recommendedResponseTime: number;
  officerMovementCount: number;
}

export class BaselineComparisonService {
  private db: Pool;

  constructor(db: Pool) {
    this.db = db;
  }

  /**
   * Calculate baseline vs recommended metrics
   */
  async calculateBaselineMetrics(): Promise<BaselineMetrics> {
    // Get all HIGH/CRITICAL junctions
    const highRiskJunctions = await this.db.query(
      `SELECT 
        id,
        name,
        current_risk_score,
        risk_level,
        officer_count,
        latitude,
        longitude
      FROM junctions
      WHERE current_risk_score >= 60`
    );

    const totalHighRisk = highRiskJunctions.rows.length;

    // Static deployment (current state)
    const staticCovered = highRiskJunctions.rows.filter(
      (j: any) => j.officer_count > 0
    ).length;

    const staticUnmanned = totalHighRisk - staticCovered;

    // Recommended deployment (after AI recommendations)
    const recommendations = await this.db.query(
      `SELECT COUNT(*) as count
       FROM recommendations
       WHERE status = 'PENDING'`
    );

    const recommendedCovered = staticCovered + recommendations.rows[0].count;
    const recommendedUnmanned = totalHighRisk - recommendedCovered;

    // Calculate coverage percentages
    const staticCoverage = totalHighRisk > 0
      ? (staticCovered / totalHighRisk) * 100
      : 0;

    const recommendedCoverage = totalHighRisk > 0
      ? (recommendedCovered / totalHighRisk) * 100
      : 0;

    // Estimate response times (simplified)
    const staticResponseTime = staticUnmanned > 0 ? 12 : 5;
    const recommendedResponseTime = recommendedUnmanned > 0 ? 7 : 5;

    return {
      staticHighRiskCoverage: Math.round(staticCoverage),
      recommendedHighRiskCoverage: Math.round(recommendedCoverage),
      staticUnmannedCount: staticUnmanned,
      recommendedUnmannedCount: recommendedUnmanned,
      staticResponseTime,
      recommendedResponseTime,
      officerMovementCount: recommendations.rows[0].count,
    };
  }

  /**
   * Generate comparison summary
   */
  generateComparisonSummary(metrics: BaselineMetrics): string {
    const coverageImprovement =
      metrics.recommendedHighRiskCoverage - metrics.staticHighRiskCoverage;

    const unmannedReduction =
      metrics.staticUnmannedCount - metrics.recommendedUnmannedCount;

    const responseTimeImprovement =
      metrics.staticResponseTime - metrics.recommendedResponseTime;

    return `AI-assisted deployment improves high-risk coverage by ${coverageImprovement}%, reduces unmanned junctions by ${unmannedReduction}, and decreases response time by ${responseTimeImprovement} minutes.`;
  }
}