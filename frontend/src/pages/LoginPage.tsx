import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      localStorage.setItem('safeflow_token', data.token);
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password. Enter the commander credentials exactly as provided.');
    } finally { setBusy(false); }
  }

  return <main className="login-shell">
    <section className="login-story"><span className="eyebrow">Nagpur Traffic Police · Decision Support</span><h1>See risk.<br/>Explain action.<br/>Deploy safely.</h1><p>Evidence-backed traffic-risk monitoring with live field coordination and human approval at every deployment decision.</p><div className="trust-row"><span>20 verified junctions</span><span>Realtime operations</span><span>Auditable decisions</span></div></section>
    <form className="login-panel" onSubmit={login}><div className="brand-mark">NS</div><h2>Commander access</h2><p>Sign in with your authorized Supabase account.</p><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="commander@safeflow.in" required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required/></label>{error&&<div className="error-banner">{error}</div>}<button className="button primary" disabled={busy}>{busy?'Verifying…':'Enter command centre'}</button><small>Historical evidence is read-only. Simulated incidents are labeled throughout.</small></form>
  </main>;
}
