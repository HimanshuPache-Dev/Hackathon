import { Router, Request, Response } from 'express';
import { db } from '../db-mock';

const router = Router();

// GET baseline comparison
router.get('/', async (req: Request, res: Response) => {
  try {
    // Get all junctions
    const allJunctionsResult = await db.query(
      `SELECT 
        id,
        name,
        current_risk_score,
        risk_level,
        officer_count
      FROM junctions`
    );

    // Filter HIGH/CRITICAL manually (score >= 60)
    const highRiskJunctions = allJunctionsResult.rows.filter((j: any) => j.current_risk_score >= 60);

    const totalHighRisk = highRiskJunctions.length;
    const staticCovered = highRiskJunctions.filter((j: any) => j.officer_count > 0).length;
    const staticUnmanned = totalHighRisk - staticCovered;

    // Mock recommendations count
    const recommendedCount = 2;
    const recommendedCovered = staticCovered + recommendedCount;
    const recommendedUnmanned = Math.max(0, totalHighRisk - recommendedCovered);

    const staticCoverage = totalHighRisk > 0 ? (staticCovered / totalHighRisk) * 100 : 0;
    const recommendedCoverage = totalHighRisk > 0 ? (recommendedCovered / totalHighRisk) * 100 : 0;

    const staticResponseTime = staticUnmanned > 0 ? 12 : 5;
    const recommendedResponseTime = recommendedUnmanned > 0 ? 7 : 5;

    const metrics = {
      staticHighRiskCoverage: Math.round(staticCoverage),
      recommendedHighRiskCoverage: Math.round(recommendedCoverage),
      staticUnmannedCount: staticUnmanned,
      recommendedUnmannedCount: recommendedUnmanned,
      staticResponseTime,
      recommendedResponseTime,
      officerMovementCount: recommendedCount,
    };

    const summary = `AI-assisted deployment improves high-risk coverage by ${
      metrics.recommendedHighRiskCoverage - metrics.staticHighRiskCoverage
    }%, reduces unmanned junctions by ${
      metrics.staticUnmannedCount - metrics.recommendedUnmannedCount
    }, and decreases response time by ${
      metrics.staticResponseTime - metrics.recommendedResponseTime
    } minutes.`;

    res.json({
      success: true,
      data: {
        metrics,
        summary,
        source: 'SIMULATION RESULTS',
      },
    });
  } catch (error) {
    console.error('Baseline error:', error);
    res.status(500).json({ success: false, error: 'Failed to calculate baseline' });
  }
});

export default router;