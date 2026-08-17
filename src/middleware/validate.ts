import { NextFunction, Request, Response } from 'express';
import { z, ZodTypeAny } from 'zod';

type Schemas = { body?: ZodTypeAny; params?: ZodTypeAny; query?: ZodTypeAny };
export function validate(schemas: Schemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    const issues: Array<{ path: string; message: string }> = [];
    for (const key of ['body','params','query'] as const) {
      const schema=schemas[key]; if(!schema)continue;
      const result=schema.safeParse(req[key]);
      if(!result.success){issues.push(...result.error.issues.map(issue=>({path:[key,...issue.path].join('.'),message:issue.message})))}else{(req as any)[key]=result.data}
    }
    if(issues.length)return res.status(400).json({success:false,error:'Request validation failed',details:issues,requestId:res.locals.requestId});
    return next();
  };
}

export const uuidParams=z.object({id:z.string().uuid()});
export const commanderLoginSchema=z.object({email:z.string().trim().email().max(254),password:z.string().min(8).max(128)}).strict();
export const officerLoginSchema=z.object({badge_code:z.string().trim().min(2).max(32),pin:z.string().regex(/^\d{4,12}$/)}).strict();
export const incidentSimulationSchema=z.object({junction_id:z.string().uuid(),severity:z.number().min(0).max(1),incident_type:z.enum(['COLLISION','CONGESTION','OBSTRUCTION'])}).strict();
export const coordinatesSchema=z.object({latitude:z.number().min(-90).max(90),longitude:z.number().min(-180).max(180),accuracy:z.number().nonnegative().max(10000).optional()}).strict();
export const arrivalSchema=z.object({junction_id:z.string().uuid()}).strict();
export const notesSchema=z.object({notes:z.string().trim().max(1000).optional()}).strict();
export const operationalNoteSchema=z.object({note:z.string().trim().min(1).max(2000),junction_id:z.string().uuid().optional(),incident_id:z.string().uuid().optional()}).strict();
export const rejectionSchema=z.object({reason:z.string().trim().min(3).max(1000)}).strict();
export const modificationSchema=z.object({newOfficerId:z.string().uuid(),newJunctionId:z.string().uuid(),notes:z.string().trim().min(3).max(1000)}).strict();
