import { Router, Request, Response } from 'express';
import { db } from '../db-mock';

const router = Router();

// GET all recommendations
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      `SELECT * FROM recommendations WHERE status = 'PENDING' ORDER BY deployment_priority DESC`
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch recommendations' });
  }
});

// POST accept recommendation
router.post('/:id/accept', async (req: Request, res: Response) => {
  try {
    const recResult = await db.query(
      `SELECT * FROM recommendations WHERE id = $1`,
      [req.params.id]
    );

    if (recResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Recommendation not found' });
    }

    const recommendation = recResult.rows[0];

    await db.query(
      `UPDATE officers
       SET status = 'DEPLOYED',
           assigned_junction_id = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [recommendation.junction_id, recommendation.officer_id]
    );

    await db.query(
      `UPDATE junctions
       SET officer_count = officer_count + 1
       WHERE id = $1`,
      [recommendation.junction_id]
    );

    await db.query(
      `UPDATE recommendations
       SET status = 'ACCEPTED',
           resolved_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [req.params.id]
    );

    await db.query(
      `INSERT INTO decision_logs (recommendation_id, decision, decided_at)
       VALUES ($1, 'ACCEPT', CURRENT_TIMESTAMP)`,
      [req.params.id]
    );

    res.json({ success: true, message: 'Recommendation accepted' });
  } catch (error) {
    console.error('Error accepting recommendation:', error);
    res.status(500).json({ success: false, error: 'Failed to accept recommendation' });
  }
});

// POST reject recommendation
router.post('/:id/reject', async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;

    await db.query(
      `UPDATE recommendations
       SET status = 'REJECTED',
           resolved_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [req.params.id]
    );

    await db.query(
      `INSERT INTO decision_logs (recommendation_id, decision, reason, decided_at)
       VALUES ($1, 'REJECT', $2, CURRENT_TIMESTAMP)`,
      [req.params.id, reason || 'No reason provided']
    );

    res.json({ success: true, message: 'Recommendation rejected' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to reject recommendation' });
  }
});

// POST modify recommendation
router.post('/:id/modify', async (req: Request, res: Response) => {
  try {
    const { newOfficerId, newJunctionId } = req.body;

    await db.query(
      `UPDATE recommendations
       SET officer_id = $1,
           junction_id = $2,
           status = 'MODIFIED'
       WHERE id = $3`,
      [newOfficerId, newJunctionId, req.params.id]
    );

    await db.query(
      `INSERT INTO decision_logs (recommendation_id, decision, decided_at)
       VALUES ($1, 'MODIFY', CURRENT_TIMESTAMP)`,
      [req.params.id]
    );

    res.json({ success: true, message: 'Recommendation modified' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to modify recommendation' });
  }
});

export default router;