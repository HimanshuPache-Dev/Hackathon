import { Pool } from 'pg';

export interface UnmannedJunction {
  junctionId: string;
  name: string;
  riskScore: number;
  riskLevel: string;
  officerCount: number;
  latitude: number;
  longitude: number;
}

export class AllocationService {
  private db: Pool;

  constructor(db: Pool) {
    this.db = db;
  }

  async detectUnmannedHighRisk(): Promise<UnmannedJunction[]> {
    const result = await this.db.query(
      `SELECT 
        id,
        name,
        current_risk_score,
        risk_level,
        officer_count,
        latitude,
        longitude
      FROM junctions
      WHERE current_risk_score >= 35
        AND officer_count = 0
      ORDER BY current_risk_score DESC`
    );

    return result.rows.map((row) => ({
      junctionId: row.id,
      name: row.name,
      riskScore: row.current_risk_score,
      riskLevel: row.risk_level,
      officerCount: row.officer_count,
      latitude: row.latitude,
      longitude: row.longitude,
    }));
  }

  async getOfficerCount(junctionId: string): Promise<number> {
    const result = await this.db.query(
      `SELECT officer_count FROM junctions WHERE id = $1`,
      [junctionId]
    );

    if (result.rows.length === 0) {
      return 0;
    }

    return result.rows[0].officer_count || 0;
  }

  async isUnmannedHighRisk(junctionId: string): Promise<boolean> {
    const result = await this.db.query(
      `SELECT 
        current_risk_score,
        officer_count
      FROM junctions
      WHERE id = $1`,
      [junctionId]
    );

    if (result.rows.length === 0) {
      return false;
    }

    const junction = result.rows[0];
    return junction.current_risk_score >= 35 && junction.officer_count === 0;
  }
}