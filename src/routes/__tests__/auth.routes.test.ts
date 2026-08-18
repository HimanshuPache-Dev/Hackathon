import express from 'express';
import request from 'supertest';

const mockMaybeSingle=jest.fn();
jest.mock('../../config/supabase',()=>({
  supabase:{from:()=>({select:()=>({eq:()=>({maybeSingle:(...args:unknown[])=>mockMaybeSingle(...args)})})})},
  signInCommander:jest.fn(),
}));
import authRoutes from '../auth.routes';
import { errorHandler,requestId } from '../../middleware/error-handler';

describe('officer login',()=>{
  beforeEach(()=>mockMaybeSingle.mockReset());

  test('unknown badge returns 401 instead of an internal error',async()=>{
    mockMaybeSingle.mockResolvedValue({data:null,error:null});
    const app=express();app.use(express.json());app.use(requestId);app.use('/auth',authRoutes);app.use(errorHandler);
    const response=await request(app).post('/auth/officer-login').send({badge_code:'INVALID',pin:'000000'});
    expect(response.status).toBe(401);expect(response.body.error).toBe('Invalid badge code or PIN');
  });
});
