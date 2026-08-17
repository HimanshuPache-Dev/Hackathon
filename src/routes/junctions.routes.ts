import { Router, Request, Response } from 'express';
import { db } from '../db-mock';

const router = Router();

// GET all junctions
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      `SELECT 
        id,
        name,
        latitude,
        longitude,
        current_risk_score,
        risk_level,
        officer_count,
        historical_severity_score,
        congestion,
        violations,
        obstructions,
        weather_risk,
        event_pressure,
        incident_severity,
        updated_at
      FROM junctions
      ORDER BY current_risk_score DESC`
    );

    res.json({
      success: true,
      data: result.rows,
      source: 'SIMULATED SCENARIO DATA',
    });
  } catch (error) {
    console.error('Error fetching junctions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch junctions' });
  }
});

// GET single junction
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      `SELECT * FROM junctions WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Junction not found' });
    }

    res.json({
      success: true,
      data: result.rows[0],
      source: 'SIMULATED SCENARIO DATA',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch junction' });
  }
});

export default router;