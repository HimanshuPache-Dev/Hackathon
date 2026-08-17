import { Router } from 'express';
import { supabase, assertDatabase } from '../config/supabase';
const router = Router();
router.get('/unmanned-critical', async (_req, res, next) => { try { const data = assertDatabase(await supabase.from('junctions').select('*').in('current_risk_level', ['HIGH', 'CRITICAL']).eq('is_unmanned', true).order('current_risk_score', { ascending: false })); res.json({ success: true, data }); } catch (error) { next(error); } });
router.get('/', async (_req, res, next) => { try { const data = assertDatabase(await supabase.from('junctions').select('*').order('current_risk_score', { ascending: false })); res.json({ success: true, data }); } catch (error) { next(error); } });
router.get('/:id', async (req, res, next) => { try { const data = assertDatabase(await supabase.from('junctions').select('*, incidents(*), recommendations(*,officers(name,badge_code))').or(`id.eq.${req.params.id},junction_id.eq.${req.params.id}`).single()); res.json({ success: true, data }); } catch (error) { next(error); } });
export default router;
