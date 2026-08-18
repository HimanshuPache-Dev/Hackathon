import { useCallback,useEffect,useState } from 'react';
import { AlertTriangle,CheckCircle2 } from 'lucide-react';
import { incidentsAPI } from '../services/api';
import { subscribeToOperations } from '../services/realtime';
import { Incident } from '../types';
import { PageHead } from './AnalyticsPage';
export default function IncidentsPage(){
  const[items,setItems]=useState<Incident[]>([]);const[busy,setBusy]=useState('');
  const load=useCallback(()=>incidentsAPI.getAll().then(r=>setItems(r.data.data)),[]);
  useEffect(()=>{void load();const unsubscribe=subscribeToOperations(()=>void load());const fallback=window.setInterval(()=>void load(),10000);return()=>{unsubscribe();window.clearInterval(fallback)}},[load]);
  async function resolve(id:string){setBusy(id);try{await incidentsAPI.resolve(id);await load()}finally{setBusy('')}}
  return <main className="workspace-page"><PageHead eyebrow="Operational event desk" title="Incident management" copy="Field reports, officer arrival, and on-scene resolution are operational records. Historical evidence remains unchanged."/><section className="incident-grid">{items.map(item=>{
    const assignments=item.recommendations??[];const intake=item.field_reports?.find(report=>report.report_kind==='FIELD_OBSERVATION');
    const resolutions=assignments.flatMap(value=>(value.field_reports??[]).filter(report=>report.report_kind==='RESOLUTION').map(report=>({...report,officer:value.officers})));
    return <article className={`incident-card ${item.status.toLowerCase()}`} key={item.id}><header><span className="incident-icon"><AlertTriangle/></span><div><span>{item.is_simulated?'SIMULATED INPUT':'FIELD REPORTED'}</span><h3>{item.junction_name}</h3></div><em>{item.status}</em></header><div className="incident-meta"><span>Type<b>{item.incident_type}</b></span><span>Severity<b>{Math.round(item.severity*100)}%</b></span><span>Current risk<b>{item.junctions?.current_risk_score??'—'}</b></span><span>Reported<b>{new Date(item.reported_at).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</b></span></div>
      {intake&&<div className="resolution-report"><strong>Reported by {intake.officers?.name??'authorized officer'} · badge {intake.officers?.badge_code??'—'}</strong><p>{intake.note}</p><time>{intake.emergency_requested?'Emergency assistance requested · dispatch not confirmed':'No emergency dispatch claim'}</time></div>}
      <div className="response-status"><strong>Officer response</strong>{assignments.length?assignments.map(value=><div key={value.id}><span>{value.officers?.name??'Assigned officer'} · {value.officer_response_status.replace('_',' ')}</span>{value.officer_arrived_at&&<time>Arrived {new Date(value.officer_arrived_at).toLocaleString('en-IN')}</time>}</div>):<p>No officer assignment approved.</p>}</div>
      {resolutions.map(report=><div className="resolution-report" key={report.id}><strong>Resolution from {report.officer?.name??'officer'}</strong><p>{report.note}</p><time>Submitted {new Date(report.created_at).toLocaleString('en-IN')}</time></div>)}
      {item.status==='ACTIVE'&&<button className="button accept" onClick={()=>resolve(item.id)} disabled={busy===item.id||(!item.is_simulated&&!resolutions.length)} title={!item.is_simulated&&!resolutions.length?'Waiting for an arrived officer resolution':'Close after review'}><CheckCircle2/>{busy===item.id?'Resolving…':item.is_simulated||resolutions.length?'Review complete · Mark resolved':'Awaiting officer resolution'}</button>}
    </article>})}</section></main>
}
