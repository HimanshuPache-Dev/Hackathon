import { NextFunction, Request, Response } from 'express';
import { getCommanderUser } from '../config/supabase';

export interface CommanderRequest extends Request { commanderId?: string }

export async function requireCommander(req: CommanderRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ success: false, error: 'Commander authentication required',requestId:res.locals.requestId });
  const user = await getCommanderUser(token);
  if (!user) return res.status(401).json({ success: false, error: 'Invalid or expired session',requestId:res.locals.requestId });
  if (user.app_metadata?.role !== 'commander') return res.status(403).json({ success: false, error: 'Commander role required',requestId:res.locals.requestId });
  req.commanderId = user.id;
  return next();
}
