import { Router } from 'express';
import { supabase, assertDatabase } from '../config/supabase';
const router = Router();
router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body.email ?? '').trim().toLowerCase();
    const password = String(req.body.password ?? '');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(error.status === 400 ? 401 : error.status ?? 500).json({ error: error.message });
    return res.json({ token: data.session?.access_token, user_id: data.user?.id, role: 'commander' });
  } catch (error) { return next(error); }
});
router.post('/logout', async (_req, res, next) => { try { const {error}=await supabase.auth.signOut();if(error)throw error;res.json({ success: true }); } catch (error) { next(error); } });
router.post('/officer-login', async (req, res, next) => {
  try { const { badge_code, pin } = req.body; const officer: any = assertDatabase(await supabase.from('officers').select('id,name,badge_code,pin_hash').eq('badge_code', badge_code).single()); if (!pin || officer.pin_hash !== pin) return res.status(401).json({ error: 'Invalid badge code or PIN' }); return res.json({ token: officer.id, officer_id: officer.id, officer_name: officer.name }); } catch (error) { return next(error); }
});
export default router;
