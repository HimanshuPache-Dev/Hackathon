import { Router, Request, Response } from 'express';
import { db } from '../db-mock';

const router = Router();

// GET all officers
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      `SELECT 
        id,
        officer_id,
        name,
        status,
        latitude,
        longitude,
        assigned_junction_id,
        is_demo
      FROM officers
      ORDER BY officer_id`
    );

    res.json({
      success: true,
      data: result.rows,
      source: 'DEMO / SIMULATED DATA',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch officers' });
  }
});

// POST start duty
router.post('/duty/start', async (req: Request, res: Response) => {
  try {
    const { officerId, latitude, longitude } = req.body;

    await db.query(
      `UPDATE officers
       SET status = 'AVAILABLE',
           latitude = $1,
           longitude = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE officer_id = $3`,
      [latitude, longitude, officerId]
    );

    res.json({ success: true, message: 'Duty started' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to start duty' });
  }
});

// POST update location
router.post('/location', async (req: Request, res: Response) => {
  try {
    const { officerId, latitude, longitude } = req.body;

    await db.query(
      `UPDATE officers
       SET latitude = $1,
           longitude = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE officer_id = $3`,
      [latitude, longitude, officerId]
    );

    res.json({ success: true, message: 'Location updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update location' });
  }
});

// POST stop duty
router.post('/duty/stop', async (req: Request, res: Response) => {
  try {
    const { officerId } = req.body;

    await db.query(
      `UPDATE officers
       SET status = 'OFFLINE',
           updated_at = CURRENT_TIMESTAMP
       WHERE officer_id = $1`,
      [officerId]
    );

    res.json({ success: true, message: 'Duty stopped' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to stop duty' });
  }
});

// POST mark arrived
router.post('/arrival', async (req: Request, res: Response) => {
  try {
    const { officerId, junctionId } = req.body;

    await db.query(
      `UPDATE officers
       SET status = 'DEPLOYED',
           assigned_junction_id = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE officer_id = $2`,
      [junctionId, officerId]
    );

    await db.query(
      `UPDATE junctions
       SET officer_count = officer_count + 1
       WHERE id = $1`,
      [junctionId]
    );

    res.json({ success: true, message: 'Arrived at junction' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to mark arrival' });
  }
});

// POST report incident
router.post('/report-incident', async (req: Request, res: Response) => {
  try {
    const { officerId, latitude, longitude, type, severity } = req.body;

    const junctionResult = await db.query(
      `SELECT id, name FROM junctions
       WHERE latitude BETWEEN $1 - 0.01 AND $1 + 0.01
         AND longitude BETWEEN $2 - 0.01 AND $2 + 0.01
       LIMIT 1`,
      [latitude, longitude]
    );

    const junctionId = junctionResult.rows[0]?.id || 'UNKNOWN';
    const junctionName = junctionResult.rows[0]?.name || 'Unknown Location';

    const incident = await db.query(
      `INSERT INTO incidents (
        junction_id,
        junction_name,
        type,
        severity,
        reported_by_officer_id,
        is_simulated,
        status
      ) VALUES ($1, $2, $3, $4, $5, false, 'ACTIVE')
      RETURNING *`,
      [junctionId, junctionName, type, severity, officerId]
    );

    res.json({ success: true, data: incident.rows[0], message: 'Incident reported' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to report incident' });
  }
});

// GET officer locations
router.get('/locations', async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      `SELECT 
        officer_id,
        name,
        status,
        latitude,
        longitude,
        updated_at
      FROM officers
      WHERE status IN ('AVAILABLE', 'DEPLOYED')`
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch locations' });
  }
});

export default router;