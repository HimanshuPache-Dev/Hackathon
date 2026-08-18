import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { baselineAPI } from '../services/api';
import { BaselineMetrics } from '../types';

export default function AnalyticsPage() {
  const [data, setData] = useState<BaselineMetrics>();
  const [error, setError] = useState('');

  useEffect(() => {
    baselineAPI.getMetrics()
      .then((response) => setData(response.data.data.metrics))
      .catch((requestError) => setError(requestError.response?.data?.error ?? 'Unable to load coverage metrics.'));
  }, []);

  const chart = data ? [
    { name: 'High-risk coverage', Baseline: Number(data.staticHighRiskCoverage) || 0, Recommended: Number(data.recommendedHighRiskCoverage) || 0 },
    { name: 'Risk-weighted coverage', Baseline: Number(data.staticRiskWeightedCoverage) || 0, Recommended: Number(data.recommendedRiskWeightedCoverage) || 0 },
  ] : [];

  return <main className="workspace-page">
    <PageHead eyebrow="Scenario simulation" title="Deployment performance" copy={`Calculated from current coverage and Haversine travel estimates using an assumed ${data?.assumedSpeedKmh ?? 24} km/h urban speed. These are estimates, not measured police outcomes.`} />
    {error
      ? <div className="error-banner" role="alert">{error}</div>
      : data
        ? <>
          <section className="comparison-grid">
            <Comparison label="High-risk coverage" before={data.staticHighRiskCoverage} after={data.recommendedHighRiskCoverage} suffix="%" />
            <Comparison label="Unmanned high-risk" before={data.staticUnmannedCount} after={data.recommendedUnmannedCount} />
            <Comparison label="Estimated response" before={data.staticResponseTime} after={data.recommendedResponseTime} suffix=" min" />
            <Comparison label="Risk-weighted coverage" before={data.staticRiskWeightedCoverage} after={data.recommendedRiskWeightedCoverage} suffix="%" />
          </section>
          <section className="analytics-card">
            <div className="card-head"><div><span className="eyebrow">Baseline vs recommended</span><h2>Coverage improvement model</h2></div><span className="scenario-pill">{data.officerMovementCount} OFFICER{data.officerMovementCount === 1 ? '' : 'S'} RECOMMENDED · SIMULATED</span></div>
            <div className="chart-host">
              <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={300}>
                <BarChart data={chart} margin={{ top: 28, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid stroke="#21343f" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#8da0ab', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} unit="%" tick={{ fill: '#718793', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value: number) => [`${value}%`]} contentStyle={{ background: '#0d1a23', border: '1px solid #2a3d48', borderRadius: 10 }} />
                  <Legend />
                  <Bar dataKey="Baseline" fill="#516b79" radius={[5, 5, 0, 0]} minPointSize={3}><LabelList dataKey="Baseline" position="top" formatter={(value: number) => `${value}%`} fill="#8da0ab" fontSize={11} /></Bar>
                  <Bar dataKey="Recommended" fill="#4fd1b3" radius={[5, 5, 0, 0]} minPointSize={3}><LabelList dataKey="Recommended" position="top" formatter={(value: number) => `${value}%`} fill="#73dfc7" fontSize={11} /></Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
        : <div className="page-loading">Calculating scenario metrics…</div>}
  </main>;
}

export function PageHead({ eyebrow, title, copy, action }: { eyebrow: string; title: string; copy: string; action?: React.ReactNode }) {
  return <header className="page-head"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{copy}</p></div>{action}</header>;
}

function Comparison({ label, before, after, suffix = '' }: { label: string; before: number; after: number; suffix?: string }) {
  return <article className="comparison"><span>{label}</span><div><b>{before}{suffix}</b><i>→</i><strong>{after}{suffix}</strong></div><small>Current baseline&nbsp;&nbsp;&nbsp;Recommended</small></article>;
}
