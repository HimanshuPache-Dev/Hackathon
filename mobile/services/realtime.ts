// Officer JWTs are API credentials rather than Supabase Auth tokens. Poll the
// officer-scoped API so mobile never bypasses backend authorization.
export function subscribeToAssignments(_officerId:string,onChange:()=>void){
  const timer=setInterval(onChange,10000);
  return()=>clearInterval(timer);
}
