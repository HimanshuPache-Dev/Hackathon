import { Pool } from 'pg';
import { OfficerAllocationService, AllocationRecommendation } from './officer-allocation.service';

export interface Recommendation {
  id: string;
  junctionId: string;
  junctionName: string;
  officerId: string;
  officerName: string;
  fromLocation: string;
  toJunction: string;
  travelMinutes: number;
  expectedRiskReduction: number;
  reasons: string[];
  status: 'PENDING' | 'ACCEPTED' | 'MODIFIED' | 'REJECTED';
  deploymentPriority: number;
  createdAt: string;
}

export class RecommendationService {
  private db: Pool;
  private allocationService: OfficerAllocationService;

  constructor(db: Pool) {
    this.db = db;
    this.allocationService = new OfficerAllocationService(db);
  }

  /**
   * Generate recommendations for all unmanned high-risk junctions
   */
  async generateAllRecommendations(): Promise<Recommendation[]> {
    // Get unmanned high-risk junctions
    const unmannedJunctions = await this.db.query(
      `SELECT 
        id,
        name,
        current_risk_score,
        risk_level,
        officer_count,
        latitude,
        longitude
      FROM junctions
      WHERE current_risk_score >= 60  -- HIGH or CRITICAL
        AND officer_count = 0
      ORDER BY current_risk_score DESC`
    );

    const recommendations: Recommendation[] = [];

    for (const junction of unmannedJunctions.rows) {
      const recommendation = await this.generateRecommendation(
        junction.id,
        junction.name,
        junction.current_risk_score
      );

      if (recommendation) {
        recommendations.push(recommendation);
      }
    }

    return recommendations;
  }

  /**
   * Generate single recommendation
   */
  async generateRecommendation(
    junctionId: string,
    junctionName: string,
    riskScore: number
  ): Promise<Recommendation | null> {
    const allocation = await this.allocationService.generateRecommendation(
      junctionId,
      junctionName,
      riskScore
    );

    if (!allocation) {
      return null;
    }

    // Calculate deployment priority
    const deploymentPriority = this.calculateDeploymentPriority(
      riskScore,
      0 // officerCount
    );

    const recommendation: Recommendation = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      junctionId,
      junctionName,
      officerId: allocation.officerId,
      officerName: allocation.officerName,
      fromLocation: allocation.reasons[0], // "Officer 07 is the closest..."
      toJunction: junctionName,
      travelMinutes: allocation.estimatedTravelTimeMinutes,
      expectedRiskReduction: allocation.riskReduction,
      reasons: allocation.reasons,
      status: 'PENDING',
      deploymentPriority,
      createdAt: new Date().toISOString(),
    };

    return recommendation;
  }

  /**
   * Calculate deployment priority
   * DeploymentPriority = 0.85 × RiskScore + 15 × CoverageGap
   */
  calculateDeploymentPriority(riskScore: number, officerCount: number): number {
    const coverageGap = officerCount === 0 ? 1 : 0;
    return 0.85 * riskScore + 15 * coverageGap;
  }

  /**
   * Save recommendation to database
   */
  async saveRecommendation(recommendation: Recommendation): Promise<void> {
    await this.db.query(
      `INSERT INTO recommendations (
        id,
        junction_id,
        officer_id,
        status,
        travel_minutes,
        expected_risk_reduction,
        reasons,
        deployment_priority,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        recommendation.id,
        recommendation.junctionId,
        recommendation.officerId,
        recommendation.status,
        recommendation.travelMinutes,
        recommendation.expectedRiskReduction,
        recommendation.reasons,
        recommendation.deploymentPriority,
        recommendation.createdAt,
      ]
    );
  }

  /**
   * Update recommendation status
   */
  async updateRecommendationStatus(
    recommendationId: string,
    status: 'ACCEPTED' | 'MODIFIED' | 'REJECTED'
  ): Promise<void> {
    await this.db.query(
      `UPDATE recommendations
       SET status = $1,
           resolved_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [status, recommendationId]
    );
  }

  /**
   * Get all pending recommendations
   */
  async getPendingRecommendations(): Promise<Recommendation[]> {
    const result = await this.db.query(
      `SELECT * FROM recommendations
       WHERE status = 'PENDING'
       ORDER BY deployment_priority DESC`
    );

    return result.rows;
  }
}