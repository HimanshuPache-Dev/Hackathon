import { Router } from 'express';
import { supabase, assertDatabase } from '../config/supabase';
import { requireCommander } from '../middleware/commander-auth';
import { ASSUMED_URBAN_SPEED_KMH,haversineKm } from '../services/allocation-engine';
const router = Router();
router.use(requireCommander);
router.get('/', async (_req, res, next) => {
  try {
    const junctions: any[] = assertDatabase(await supabase.from('junctions').select('id,latitude,longitude,historical_crashes,fatalities,weighted_severity_index,historical_risk_score,historical_tier,required_officers,assigned_officers,is_unmanned'));
    const officers:any[]=assertDatabase(await supabase.from('officers').select('latitude,longitude,status').eq('status','AVAILABLE').not('latitude','is',null).not('longitude','is',null));
    const highRisk = junctions.filter((j) => ['HIGH', 'CRITICAL'].includes(j.historical_tier));
    const pending: any[] = assertDatabase(await supabase.from('recommendations').select('junction_id,travel_time_minutes').eq('status', 'PENDING'));
    const pendingByJunction = pending.reduce((counts:Map<string,number>,item:any)=>counts.set(item.junction_id,(counts.get(item.junction_id)??0)+1),new Map<string,number>());
    const required=(j:any)=>Math.max(1,Number(j.required_officers) || 1);
    const assigned=(j:any)=>Math.max(0,Number(j.assigned_officers) || 0);
    const totalRequired=highRisk.reduce((sum,j)=>sum+required(j),0);
    const staticStaffing=highRisk.reduce((sum,j)=>sum+Math.min(required(j),assigned(j)),0);
    const recommendedStaffing=highRisk.reduce((sum,j)=>sum+Math.min(required(j),assigned(j)+(pendingByJunction.get(j.id)??0)),0);
    const pct = (value: number) => totalRequired ? Math.round(value / totalRequired * 100) : 0;
    const avgTravel = pending.length ? Math.round(pending.reduce((sum, item) => sum + item.travel_time_minutes, 0) / pending.length) : 0;
    const baselineTrips=highRisk.filter(j=>j.is_unmanned).map(j=>Math.min(...officers.map(o=>Math.max(2,Math.ceil(haversineKm(j,o)/(ASSUMED_URBAN_SPEED_KMH/60)))))).filter(Number.isFinite);
    const baselineEstimate=baselineTrips.length?Math.round(baselineTrips.reduce((a,b)=>a+b,0)/baselineTrips.length):0;
    const totalRisk = highRisk.reduce((sum,j)=>sum+(j.historical_risk_score??0),0);
    const staticRisk = highRisk.reduce((sum,j)=>sum+(j.historical_risk_score??0)*Math.min(1,assigned(j)/required(j)),0);
    const recommendedRisk = highRisk.reduce((sum,j)=>sum+(j.historical_risk_score??0)*Math.min(1,(assigned(j)+(pendingByJunction.get(j.id)??0))/required(j)),0);
    const staticUnmanned=highRisk.filter(j=>assigned(j)===0).length;
    const recommendedUnmanned=highRisk.filter(j=>assigned(j)+(pendingByJunction.get(j.id)??0)===0).length;
    const tierCounts=junctions.reduce((counts:any,j:any)=>({...counts,[j.historical_tier]:(counts[j.historical_tier]??0)+1}),{});
    res.json({ success: true, data: { metrics: { historicalJunctionCount:junctions.length,historicalCrashTotal:junctions.reduce((sum,j)=>sum+(j.historical_crashes??0),0),historicalFatalityTotal:junctions.reduce((sum,j)=>sum+(j.fatalities??0),0),historicalWeightedSeverityTotal:junctions.reduce((sum,j)=>sum+(j.weighted_severity_index??0),0),historicalTierCounts:tierCounts,staticHighRiskCoverage: pct(staticStaffing), recommendedHighRiskCoverage: pct(recommendedStaffing), staticUnmannedCount: staticUnmanned, recommendedUnmannedCount: recommendedUnmanned, staticResponseTime:baselineEstimate, recommendedResponseTime:avgTravel, officerMovementCount: pending.length, staticRiskWeightedCoverage:totalRisk?Math.round(staticRisk/totalRisk*100):0, recommendedRiskWeightedCoverage:totalRisk?Math.round(recommendedRisk/totalRisk*100):0,assumedSpeedKmh:ASSUMED_URBAN_SPEED_KMH }, summary: 'Historical baseline is sourced from the uploaded 20-junction workbook. Deployment comparison is a clearly labelled operational simulation.', source: 'Nagpur 20-junction historical workbook + Supabase operational scenario' } });
  } catch (error) { next(error); }
});
export default router;
