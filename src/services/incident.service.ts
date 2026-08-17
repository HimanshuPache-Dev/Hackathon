import { Pool } from 'pg';
import { RiskService } from './risk.service';
import { RecommendationService } from './recommendation.service';

export interface Incident {
  id: string;
  junctionId: string;
  junctionName: string;
  type: string;
  severity: 'MINOR' | 'MAJOR' | 'SEVERE' | 'CRITICAL';
  severityValue: number; // 0.25, 0.50, 0.75, 1.0
  isSimulated: boolean;
  durationMinutes: number;
  createdAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'RESOLVED';
}

export class IncidentService {
  private db: Pool;
  private riskService: RiskService;
  private recommendationService: RecommendationService;

  constructor(db: Pool, riskService: RiskService, recommendationService: RecommendationService) {
    this.db = db;
    this.riskService = riskService;
    this.recommendationService = recommendationService;
  }

  /**
   * Simulate incident at Juni Pardi Naka Chowk
   */
  async simulateIncident(
    junctionId: string,
    severity: 'CRITICAL'
  ): Promise<Incident> {
    const severityValue = 1.0; // CRITICAL
    const durationMinutes = 15;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationMinutes * 60000);

    // Create incident record
    const incident: Incident = {
      id: `inc-${Date.now()}`,
      junctionId,
      junctionName: 'Juni Pardi Naka Chowk',
      type: 'Collision',
      severity,
      severityValue,
      isSimulated: true,
      durationMinutes,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'ACTIVE',
    };

    // Save to database
    await this.db.query(
      `INSERT INTO incidents (
        id,
        junction_id,
        type,
        severity,
        severity_value,
        is_simulated,
        duration_minutes,
        created_at,
        expires_at,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        incident.id,
        incident.junctionId,
        incident.type,
        incident.severity,
        incident.severityValue,
        incident.isSimulated,
        incident.durationMinutes,
        incident.createdAt,
        incident.expiresAt,
        incident.status,
      ]
    );

    // Update junction incident severity to 1.0
    await this.db.query(
      `UPDATE junctions
       SET incident_severity = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [severityValue, junctionId]
    );

    // Add ripple effect to nearby junctions (0.15 incident pressure)
    await this.addRippleEffect(junctionId, 0.15);

    // Recalculate all junctions
    await this.riskService.recalculateAll();

    // Generate new recommendations
    await this.recommendationService.generateAllRecommendations();

    return incident;
  }

  /**
   * Add ripple effect to nearby junctions
   */
  private async addRippleEffect(
    centerJunctionId: string,
    rippleFactor: number
  ): Promise<void> {
    // Get center junction coordinates
    const centerResult = await this.db.query(
      `SELECT latitude, longitude FROM junctions WHERE id = $1`,
      [centerJunctionId]
    );

    if (centerResult.rows.length === 0) return;

    const center = centerResult.rows[0];

    // Find nearby junctions (within 2 km) and add ripple effect
    await this.db.query(
      `UPDATE junctions
       SET incident_severity = COALESCE(incident_severity, 0) + $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id != $2
         AND latitude BETWEEN $3 - 0.02 AND $3 + 0.02
         AND longitude BETWEEN $4 - 0.02 AND $4 + 0.02`,
      [
        rippleFactor,
        centerJunctionId,
        center.latitude,
        center.longitude,
      ]
    );
  }

  /**
   * Resolve incident
   */
  async resolveIncident(incidentId: string): Promise<void> {
    // Get incident details
    const result = await this.db.query(
      `SELECT junction_id FROM incidents WHERE id = $1`,
      [incidentId]
    );

    if (result.rows.length === 0) return;

    const junctionId = result.rows[0].junction_id;

    // Reset incident severity to 0
    await this.db.query(
      `UPDATE junctions
       SET incident_severity = 0,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [junctionId]
    );

    // Update incident status
    await this.db.query(
      `UPDATE incidents
       SET status = 'RESOLVED'
       WHERE id = $1`,
      [incidentId]
    );

    // Recalculate all junctions
    await this.riskService.recalculateAll();
  }

  /**
   * Get active incidents
   */
  async getActiveIncidents(): Promise<Incident[]> {
    const result = await this.db.query(
      `SELECT * FROM incidents
       WHERE status = 'ACTIVE'
       ORDER BY created_at DESC`
    );

    return result.rows;
  }
}