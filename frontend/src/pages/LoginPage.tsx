import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { authAPI } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function login(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const { data } = await authAPI.login(email.trim().toLowerCase(), password);
      localStorage.setItem('policeops_token', data.token);
      navigate('/dashboard');
    } catch (reason) {
      if (axios.isAxiosError(reason) && reason.response?.status === 429) {
        setError('Too many login attempts. Please wait before trying again.');
      } else if (axios.isAxiosError(reason) && reason.response?.status === 403) {
        setError('This account does not have the commander role.');
      } else if (axios.isAxiosError(reason) && (reason.response?.status??0) >= 500) {
        setError('Commander authentication is temporarily unavailable because Supabase cannot be reached. Your credentials were not rejected; retry when the service connection is restored.');
      } else if (axios.isAxiosError(reason) && reason.response?.status === 401) {
        setError('Invalid email or password. Enter the commander credentials exactly as provided.');
      } else if (axios.isAxiosError(reason) && !reason.response) {
        setError('PoliceOps cannot reach the API. Confirm that the backend is running on port 3001.');
      } else {
        setError('Commander login could not be completed. Please retry.');
      }
    } finally { setBusy(false); }
  }

  return <main className="login-shell">
    <section className="login-story"><span className="eyebrow">Nagpur Traffic Police · Decision Support</span><h1>See risk.<br/>Explain action.<br/>Deploy safely.</h1><p>Evidence-backed traffic-risk monitoring with live field coordination and human approval at every deployment decision.</p><div className="trust-row"><span>20 verified junctions</span><span>Realtime operations</span><span>Auditable decisions</span></div></section>
    <form className="login-panel" onSubmit={login}><div className="brand-mark">PO</div><h2>Commander access</h2><p>Sign in with your authorized Supabase account.</p><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="commander email" required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required/></label>{error&&<div className="error-banner">{error}</div>}<button className="button primary" disabled={busy}>{busy?'Verifying…':'Enter command centre'}</button><small>Historical evidence is read-only. Simulated incidents are labeled throughout.</small></form>
  </main>;
}
