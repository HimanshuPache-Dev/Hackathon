import { Router } from 'express';
import { supabase, assertDatabase } from '../config/supabase';
import { requireCommander } from '../middleware/commander-auth';
import { PublicError } from '../middleware/error-handler';
import { incidentSimulationSchema,uuidParams,validate } from '../middleware/validate';
const router = Router();
router.use(requireCommander);
router.get('/', async (_req,res,next)=>{try{const data=assertDatabase(await supabase.from('incidents').select('*,junctions(junction_id,current_risk_score,current_risk_level),recommendations(id,status,officer_response_status,officer_arrived_at,officers(id,name,badge_code),field_reports(id,note,created_at,report_kind))').order('reported_at',{ascending:false}));res.json({success:true,data})}catch(error){next(error)}});

router.post('/simulate', validate({body:incidentSimulationSchema}),async (req, res, next) => {
  try {
    const {data,error}=await supabase.rpc('simulate_incident_atomic',{p_junction_id:req.body.junction_id,p_severity:req.body.severity,p_incident_type:req.body.incident_type,p_reporter_user_id:(req as any).commanderId,p_is_simulated:true});
    if(error)throw error;if(data?.code==='NOT_FOUND')throw new PublicError(404,data.message);if(data?.code==='CONFLICT')throw new PublicError(409,data.message);if(data?.code==='INVALID')throw new PublicError(400,data.message);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
});
router.post('/:id/resolve',validate({params:uuidParams}),async(req,res,next)=>{try{const{data,error}=await supabase.rpc('resolve_incident',{p_incident_id:req.params.id});if(error)throw error;if(data?.code==='CONFLICT')throw new PublicError(409,data.message);if(data?.code==='NOT_FOUND')throw new PublicError(404,data.message);res.json({success:true,data})}catch(error){next(error)}});
router.get('/active', async (_req, res, next) => { try { const data = assertDatabase(await supabase.from('incidents').select('*').eq('status', 'ACTIVE').order('reported_at', { ascending: false })); res.json({ success: true, data }); } catch (error) { next(error); } });
export default router;
