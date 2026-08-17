import { Router } from 'express';
import { assertDatabase, supabase } from '../config/supabase';
import { requireCommander } from '../middleware/commander-auth';
const router=Router();
router.use(requireCommander);
router.get('/',async(_req,res,next)=>{try{const data=assertDatabase(await supabase.from('decision_logs').select('*,recommendations(recommendation_text,junctions(name),officers(name,badge_code))').order('timestamp',{ascending:false}).limit(100));res.json({success:true,data})}catch(error){next(error)}});
export default router;
