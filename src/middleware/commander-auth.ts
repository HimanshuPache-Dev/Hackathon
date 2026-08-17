import { NextFunction, Request, Response } from 'express';
import { supabaseAuth } from '../config/supabase';

export interface CommanderRequest extends Request { commanderId?: string }

export async function requireCommander(req: CommanderRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ success: false, error: 'Commander authentication required' });
  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ success: false, error: 'Invalid or expired session' });
  req.commanderId = data.user.id;
  return next();
}
