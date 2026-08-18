import { FormEvent,useCallback,useEffect,useState } from 'react';
import { Route,X } from 'lucide-react';
import RecommendationCard from '../components/RecommendationCard';
import { junctionsAPI,officersAPI,recommendationsAPI } from '../services/api';
import { Junction,Officer,Recommendation } from '../types';
import { PageHead } from './AnalyticsPage';

const errorMessage=(error:any,fallback:string)=>error?.response?.data?.error??error?.response?.data?.message??fallback;

export default function RecommendationsPage(){
  const[items,setItems]=useState<Recommendation[]>([]);const[officers,setOfficers]=useState<Officer[]>([]);const[junctions,setJunctions]=useState<Junction[]>([]);
  const[modify,setModify]=useState<Recommendation|null>(null);const[officerId,setOfficerId]=useState('');const[junctionId,setJunctionId]=useState('');const[note,setNote]=useState('');
  const[notice,setNotice]=useState('');const[error,setError]=useState('');const[busy,setBusy]=useState('');
  const load=useCallback(async()=>{try{const[r,o,j]=await Promise.all([recommendationsAPI.getAll(),officersAPI.getAll(),junctionsAPI.getAll()]);setItems(r.data.data);setOfficers(o.data.data);setJunctions(j.data.data);setError('')}catch(reason){setError(errorMessage(reason,'Unable to load recommendations.'))}},[]);
  useEffect(()=>{void load()},[load]);
  async function decide(id:string,operation:()=>Promise<unknown>,success:string){if(busy)return;setBusy(id);setError('');try{await operation();setNotice(success);await load()}catch(reason){setError(errorMessage(reason,'The recommendation decision could not be completed. Refresh and try again.'))}finally{setBusy('')}}
  function accept(id:string){void decide(id,()=>recommendationsAPI.accept(id),'Deployment accepted. The assigned officer is now EN_ROUTE.')}
  function reject(id:string){const reason=prompt('Rejection reason (required):');if(!reason?.trim())return;void decide(id,()=>recommendationsAPI.reject(id,reason.trim()),'Recommendation rejected and logged.')}
  function openModify(item:Recommendation){setModify(item);setOfficerId(item.officer_id);setJunctionId(item.junction_id);setNote('');setError('')}
  async function save(event:FormEvent){event.preventDefault();if(!modify||!note.trim()||busy)return;const id=modify.id;setBusy(id);setError('');try{await recommendationsAPI.modify(id,{newOfficerId:officerId,newJunctionId:junctionId,notes:note.trim()});setModify(null);setNotice('Modified recommendation saved to the audit trail.');await load()}catch(reason){setError(errorMessage(reason,'The modified deployment could not be saved.'))}finally{setBusy('')}}
  const eligibleOfficers=officers.filter(value=>value.status==='AVAILABLE'||value.id===modify?.officer_id);
  return <main className="workspace-page"><PageHead eyebrow="Human-in-the-loop deployment" title="Recommendation review" copy="Algorithms propose. Commanders decide. No officer assignment changes until an authorized decision is recorded."/>
    {error&&<div className="error-banner" role="alert">{error}</div>}{notice&&<div className="inline-success">{notice}<button onClick={()=>setNotice('')}><X/></button></div>}
    <section className="review-stack">{items.length?items.map(item=><RecommendationCard key={item.id} item={item} busy={busy===item.id} onAccept={()=>accept(item.id)} onReject={()=>reject(item.id)} onModify={()=>openModify(item)}/>):<div className="empty-state large"><Route/><div><strong>No pending recommendations</strong><span>Run a labeled incident simulation from Live operations to generate one.</span></div></div>}</section>
    {modify&&<div className="modal-backdrop"><form className="modal" onSubmit={save}><span className="eyebrow">Commander modification</span><h2>Adjust deployment proposal</h2><p>Choose an available officer or target junction and explain why the recommendation was changed.</p><label>Officer<select value={officerId} onChange={e=>setOfficerId(e.target.value)} required>{eligibleOfficers.map(o=><option value={o.id} key={o.id}>{o.badge_code} · {o.name} · {o.status}</option>)}</select></label><label>Target junction<select value={junctionId} onChange={e=>setJunctionId(e.target.value)} required>{junctions.map(j=><option value={j.id} key={j.id}>{j.junction_id} · {j.name} · Risk {j.current_risk_score}</option>)}</select></label><label>Commander note<textarea value={note} onChange={e=>setNote(e.target.value)} required placeholder="Reason for modifying this recommendation"/></label><div className="decision-actions"><button className="button accept" disabled={busy===modify.id}>{busy===modify.id?'Saving…':'Save modification'}</button><button type="button" className="button ghost" onClick={()=>setModify(null)} disabled={busy===modify.id}>Cancel</button></div></form></div>}
  </main>
}
