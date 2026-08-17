import { randomUUID } from 'crypto';import { NextFunction,Request,Response } from 'express';
export class PublicError extends Error{constructor(public status:number,public publicMessage:string){super(publicMessage)}}
export function requestId(req:Request,res:Response,next:NextFunction){const id=String(req.headers['x-request-id']??randomUUID());res.locals.requestId=id;res.setHeader('X-Request-Id',id);next()}
export function errorHandler(error:unknown,_req:Request,res:Response,_next:NextFunction){const id=res.locals.requestId;if(error instanceof PublicError)return res.status(error.status).json({success:false,error:error.publicMessage,requestId:id});console.error(`[${id}]`,error);return res.status(500).json({success:false,error:'An internal server error occurred',requestId:id})}
