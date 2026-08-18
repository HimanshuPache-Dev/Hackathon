import { Pool } from 'pg';
import { calculateRiskScore, normalizeHistoricalScore, RiskInputs } from '../risk/calculator';
import { ExplainabilityService } from './explainability.service';

export class RiskService {
  private db: Pool;
  private explainabilityService: ExplainabilityService;

  constructor(db: Pool) {
    this.db = db;
    this.explainabilityService = new ExplainabilityService();
  }

  /**
   * Calculate risk for one junction with explanation
   */
  async calculateJunctionRiskWithExplanation(junctionId: string) {
    const result = await this.db.query(
      `SELECT 
        id,
        name,
        historical_severity_score,
        congestion,
        violations,
        obstructions,
        weather_risk,
        event_pressure,
        incident_severity
      FROM junctions
      WHERE id = $1`,
      [junctionId]
    );

    if (result.rows.length === 0) {
      throw new Error(`Junction ${junctionId} not found`);
    }

    const junction = result.rows[0];
    const inputs: RiskInputs = {
      accidentHistory: normalizeHistoricalScore(junction.historical_severity_score),
      congestion: junction.congestion || 0,
      violations: junction.violations || 0,
      obstructions: junction.obstructions || 0,
      weather: junction.weather_risk || 0,
      events: junction.event_pressure || 0,
      incidents: junction.incident_severity || 0,
    };

    const calculation = calculateRiskScore(inputs);
    const explanation = this.explainabilityService.generateExplanation(
      junction.name,
      calculation
    );

    // Update database
    await this.db.query(
      `UPDATE junctions
       SET current_risk_score = $1,
           risk_level = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [calculation.score, calculation.level, junctionId]
    );

    return {
      junctionId: junction.id,
      junctionName: junction.name,
      score: calculation.score,
      level: calculation.level,
      explanation,
    };
  }

  /**
   * Get explanation for a junction (without recalculating)
   */
  async getJunctionExplanation(junctionId: string) {
    const result = await this.db.query(
      `SELECT 
        id,
        name,
        current_risk_score,
        risk_level,
        historical_severity_score,
        congestion,
        violations,
        obstructions,
        weather_risk,
        event_pressure,
        incident_severity
      FROM junctions
      WHERE id = $1`,
      [junctionId]
    );

    if (result.rows.length === 0) {
      throw new Error(`Junction ${junctionId} not found`);
    }

    const junction = result.rows[0];
    const inputs: RiskInputs = {
      accidentHistory: normalizeHistoricalScore(junction.historical_severity_score),
      congestion: junction.congestion || 0,
      violations: junction.violations || 0,
      obstructions: junction.obstructions || 0,
      weather: junction.weather_risk || 0,
      events: junction.event_pressure || 0,
      incidents: junction.incident_severity || 0,
    };

    const calculation = calculateRiskScore(inputs);
    const explanation = this.explainabilityService.generateExplanation(
      junction.name,
      calculation
    );

    return {
      junctionId: junction.id,
      junctionName: junction.name,
      score: calculation.score,
      level: calculation.level,
      explanation,
    };
  }
}