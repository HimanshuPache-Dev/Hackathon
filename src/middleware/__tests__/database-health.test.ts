import express from 'express';
import request from 'supertest';
import { errorHandler,requestId } from '../error-handler';

describe('database availability responses',()=>{
  test('classifies a Supabase/PostgREST failure as 503',async()=>{
    const app=express();app.use(requestId);app.get('/failure',(_req,_res,next)=>next({code:'PGRST000',message:'connection failure',details:null,hint:null}));app.use(errorHandler);
    const response=await request(app).get('/failure');
    expect(response.status).toBe(503);expect(response.body).toMatchObject({success:false,error:'Database unavailable',message:'Cannot connect to database. Retry later.'});
  });

  test('keeps unrelated failures as 500',async()=>{
    const app=express();app.use(requestId);app.get('/failure',(_req,_res,next)=>next(new Error('Unexpected application failure')));app.use(errorHandler);
    const response=await request(app).get('/failure');
    expect(response.status).toBe(500);expect(response.body.error).toBe('An internal server error occurred');
  });
});
