import { NextFunction,Request,Response } from 'express';
import jwt from 'jsonwebtoken';

const issuer='nagpur-safeflow-api';const audience='nagpur-safeflow-officer';
export interface OfficerRequest extends Request{officerId?:string;actorRole?:'officer'}
export function issueOfficerToken(officerId:string){const secret=process.env.OFFICER_JWT_SECRET;if(!secret||secret.length<32)throw new Error('OFFICER_JWT_SECRET must contain at least 32 characters');return jwt.sign({role:'officer'},secret,{subject:officerId,issuer,audience,expiresIn:'30m',algorithm:'HS256'})}
export function requireOfficer(req:OfficerRequest,res:Response,next:NextFunction){const secret=process.env.OFFICER_JWT_SECRET;const token=req.headers.authorization?.replace(/^Bearer\s+/i,'');if(!secret||!token)return res.status(401).json({success:false,error:'Officer authentication required'});try{const payload=jwt.verify(token,secret,{issuer,audience,algorithms:['HS256']});if(typeof payload==='string'||payload.role!=='officer'||!payload.sub)return res.status(403).json({success:false,error:'Officer role required'});req.officerId=payload.sub;req.actorRole='officer';return next()}catch{return res.status(401).json({success:false,error:'Invalid or expired officer session'})}}
export function requireMatchingOfficer(req:OfficerRequest,res:Response,next:NextFunction){if(req.officerId!==req.params.id)return res.status(403).json({success:false,error:'Officer identity does not match requested resource'});return next()}
