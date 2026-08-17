import { Router, Request, Response } from 'express';
import { db } from '../db-mock';

const router = Router();

// POST simulate incident
router.post('/simulate', async (req: Request, res: Response) => {
  try {
    const { junctionId, severity } = req.body;

    const incident = await db.query(
      `INSERT INTO incidents (
        junction_id,
        junction_name,
        type,
        severity,
        severity_value,
        is_simulated,
        status,
        created_at,
        expires_at
      ) VALUES ($1, $2, $3, $4, $5, true, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '15 minutes')
      RETURNING *`,
      [junctionId, 'Juni Pardi Naka Chowk', 'Collision', severity, 1.0]
    );

    await db.query(
      `UPDATE junctions
       SET incident_severity = 1.0,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [junctionId]
    );

    const junctionsResult = await db.query(
      `SELECT * FROM junctions ORDER BY current_risk_score DESC`
    );

    res.json({
      success: true,
      data: {
        incident: incident.rows[0],
        junctions: junctionsResult.rows,
      },
      message: 'Incident simulated successfully',
    });
  } catch (error) {
    console.error('Error simulating incident:', error);
    res.status(500).json({ success: false, error: 'Failed to simulate incident' });
  }
});

// POST resolve incident
router.post('/:id/resolve', async (req: Request, res: Response) => {
  try {
    const incidentResult = await db.query(
      `SELECT junction_id FROM incidents WHERE id = $1`,
      [req.params.id]
    );

    if (incidentResult.rows.length > 0) {
      const junctionId = incidentResult.rows[0].junction_id;

      await db.query(
        `UPDATE junctions
         SET incident_severity = 0,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [junctionId]
      );

      await db.query(
        `UPDATE incidents
         SET status = 'RESOLVED'
         WHERE id = $1`,
        [req.params.id]
      );
    }

    res.json({ success: true, message: 'Incident resolved' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to resolve incident' });
  }
});

// GET active incidents
router.get('/active', async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      `SELECT * FROM incidents WHERE status = 'ACTIVE' ORDER BY created_at DESC`
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch incidents' });
  }
});

export default router;