import rateLimit from 'express-rate-limit';
export const loginLimiter=rateLimit({windowMs:15*60*1000,limit:10,skipSuccessfulRequests:true,standardHeaders:true,legacyHeaders:false,handler:(_req,res)=>res.status(429).json({success:false,error:'Too many login attempts. Try again later.',requestId:res.locals.requestId})});
