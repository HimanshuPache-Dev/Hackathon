import { Router } from 'express';
import { supabase, assertDatabase } from '../config/supabase';
import { requireCommander } from '../middleware/commander-auth';
import { ASSUMED_URBAN_SPEED_KMH,haversineKm } from '../services/allocation-engine';
const router = Router();
router.use(requireCommander);
router.get('/', async (_req, res, next) => {
  try {
    const junctions: any[] = assertDatabase(await supabase.from('junctions').select('id,latitude,longitude,current_risk_score,current_risk_level,assigned_officers,is_unmanned'));
    const officers:any[]=assertDatabase(await supabase.from('officers').select('latitude,longitude,status').eq('status','AVAILABLE').not('latitude','is',null).not('longitude','is',null));
    const highRisk = junctions.filter((j) => ['HIGH', 'CRITICAL'].includes(j.current_risk_level));
    const covered = highRisk.filter((j) => !j.is_unmanned).length;
    const pending: any[] = assertDatabase(await supabase.from('recommendations').select('junction_id,travel_time_minutes').eq('status', 'PENDING'));
    const recommendedIds = new Set(pending.map((item) => item.junction_id));
    const recommendedCovered = highRisk.filter((j) => !j.is_unmanned || recommendedIds.has(j.id)).length;
    const pct = (value: number) => highRisk.length ? Math.round(value / highRisk.length * 100) : 0;
    const avgTravel = pending.length ? Math.round(pending.reduce((sum, item) => sum + item.travel_time_minutes, 0) / pending.length) : 0;
    const baselineTrips=highRisk.filter(j=>j.is_unmanned).map(j=>Math.min(...officers.map(o=>Math.max(2,Math.ceil(haversineKm(j,o)/(ASSUMED_URBAN_SPEED_KMH/60)))))).filter(Number.isFinite);
    const baselineEstimate=baselineTrips.length?Math.round(baselineTrips.reduce((a,b)=>a+b,0)/baselineTrips.length):0;
    const totalRisk = highRisk.reduce((sum,j)=>sum+(j.current_risk_score??0),0);
    const staticRisk = highRisk.filter(j=>!j.is_unmanned).reduce((sum,j)=>sum+(j.current_risk_score??0),0);
    const recommendedRisk = highRisk.filter(j=>!j.is_unmanned||recommendedIds.has(j.id)).reduce((sum,j)=>sum+(j.current_risk_score??0),0);
    res.json({ success: true, data: { metrics: { staticHighRiskCoverage: pct(covered), recommendedHighRiskCoverage: pct(recommendedCovered), staticUnmannedCount: highRisk.length - covered, recommendedUnmannedCount: highRisk.length - recommendedCovered, staticResponseTime:baselineEstimate, recommendedResponseTime:avgTravel, officerMovementCount: pending.length, staticRiskWeightedCoverage:totalRisk?Math.round(staticRisk/totalRisk*100):0, recommendedRiskWeightedCoverage:totalRisk?Math.round(recommendedRisk/totalRisk*100):0,assumedSpeedKmh:ASSUMED_URBAN_SPEED_KMH }, summary: 'Scenario simulation calculated from current database coverage and Haversine travel estimates.', source: 'Supabase current scenario' } });
  } catch (error) { next(error); }
});
export default router;
