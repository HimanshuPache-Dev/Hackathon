import { Pool } from 'pg';

export interface Officer {
  id: string;
  officerId: string;
  name: string;
  status: 'AVAILABLE' | 'DEPLOYED' | 'BUSY' | 'OFF_DUTY';
  latitude: number | null;
  longitude: number | null;
  assignedJunctionId: string | null;
}

export interface AllocationRecommendation {
  junctionId: string;
  junctionName: string;
  officerId: string;
  officerName: string;
  distanceKm: number;
  estimatedTravelTimeMinutes: number;
  riskReduction: number;
  reasons: string[];
}

export class OfficerAllocationService {
  private db: Pool;

  constructor(db: Pool) {
    this.db = db;
  }

  /**
   * Calculate distance between two GPS coordinates using Haversine formula
   * Returns distance in kilometers
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
      Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Find nearest available officer to a junction
   */
  async findNearestAvailableOfficer(
    junctionId: string
  ): Promise<Officer | null> {
    // Get junction coordinates
    const junctionResult = await this.db.query(
      `SELECT latitude, longitude FROM junctions WHERE id = $1`,
      [junctionId]
    );

    if (junctionResult.rows.length === 0) {
      return null;
    }

    const junction = junctionResult.rows[0];
    const junctionLat = junction.latitude;
    const junctionLon = junction.longitude;

    // Get all available officers
    const officersResult = await this.db.query(
      `SELECT 
        id,
        officer_id,
        name,
        status,
        latitude,
        longitude,
        assigned_junction_id
      FROM officers
      WHERE status = 'AVAILABLE'
        AND latitude IS NOT NULL
        AND longitude IS NOT NULL`
    );

    if (officersResult.rows.length === 0) {
      return null;
    }

    // Find nearest officer
    let nearestOfficer: Officer | null = null;
    let minDistance = Infinity;

    for (const officerRow of officersResult.rows) {
      const distance = this.calculateDistance(
        junctionLat,
        junctionLon,
        officerRow.latitude,
        officerRow.longitude
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestOfficer = {
          id: officerRow.id,
          officerId: officerRow.officer_id,
          name: officerRow.name,
          status: officerRow.status,
          latitude: officerRow.latitude,
          longitude: officerRow.longitude,
          assignedJunctionId: officerRow.assigned_junction_id,
        };
      }
    }

    return nearestOfficer;
  }

  /**
   * Generate deployment recommendation
   */
  async generateRecommendation(
    junctionId: string,
    junctionName: string,
    riskScore: number
  ): Promise<AllocationRecommendation | null> {
    const nearestOfficer = await this.findNearestAvailableOfficer(junctionId);

    if (!nearestOfficer || nearestOfficer.latitude === null || nearestOfficer.longitude === null) {
      return null;
    }

    // Get junction coordinates
    const junctionResult = await this.db.query(
      `SELECT latitude, longitude FROM junctions WHERE id = $1`,
      [junctionId]
    );

    if (junctionResult.rows.length === 0) {
      return null;
    }

    const junction = junctionResult.rows[0];

    // Calculate distance
    const distance = this.calculateDistance(
      junction.latitude,
      junction.longitude,
      nearestOfficer.latitude,
      nearestOfficer.longitude
    );

    // Calculate travel time (assume 30 km/h average speed in city)
    const travelTimeMinutes = (distance / 30) * 60;

    // Generate reasons
    const reasons = [
      `${nearestOfficer.officerId} is the closest available unit at ${distance.toFixed(1)} km distance`,
      `Deployment will reduce response time to ${travelTimeMinutes.toFixed(0)} minutes`,
      `Junction has risk score of ${riskScore.toFixed(1)} and is currently unmanned`,
    ];

    return {
      junctionId,
      junctionName,
      officerId: nearestOfficer.id,
      officerName: nearestOfficer.name,
      distanceKm: distance,
      estimatedTravelTimeMinutes: travelTimeMinutes,
      riskReduction: 15, // Expected improvement
      reasons,
    };
  }

  /**
   * Get all available officers
   */
  async getAvailableOfficers(): Promise<Officer[]> {
    const result = await this.db.query(
      `SELECT 
        id,
        officer_id,
        name,
        status,
        latitude,
        longitude,
        assigned_junction_id
      FROM officers
      WHERE status = 'AVAILABLE'`
    );

    return result.rows.map((row) => ({
      id: row.id,
      officerId: row.officer_id,
      name: row.name,
      status: row.status,
      latitude: row.latitude,
      longitude: row.longitude,
      assignedJunctionId: row.assigned_junction_id,
    }));
  }
}