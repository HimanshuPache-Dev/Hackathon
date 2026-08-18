import request from 'supertest';

const mockLimit=jest.fn();
jest.mock('../../config/supabase',()=>({
  supabase:{from:()=>({select:()=>({limit:(...args:unknown[])=>mockLimit(...args)})})},
  supabaseAuth:{},
  assertDatabase:(value:unknown)=>value,
}));
import app from '../../index';

describe('GET /api/health',()=>{
  beforeEach(()=>mockLimit.mockReset());

  test('reports a live database connection',async()=>{
    mockLimit.mockResolvedValue({data:null,error:null,count:0});
    const response=await request(app).get('/api/health');
    expect(response.status).toBe(200);expect(response.body).toMatchObject({status:'ok',database:'connected'});
  });

  test('reports database unavailability',async()=>{
    mockLimit.mockResolvedValue({data:null,error:{code:'PGRST000',message:'connection failure'}});
    const response=await request(app).get('/api/health');
    expect(response.status).toBe(503);expect(response.body).toEqual({status:'down',database:'unavailable',error:'Cannot connect to database'});
  });
});
