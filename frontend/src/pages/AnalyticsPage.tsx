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
    { name: 'High-risk staffing', Current: Number(data.staticHighRiskCoverage) || 0, Recommended: Number(data.recommendedHighRiskCoverage) || 0 },
    { name: 'Historical-risk-weighted staffing', Current: Number(data.staticRiskWeightedCoverage) || 0, Recommended: Number(data.recommendedRiskWeightedCoverage) || 0 },
  ] : [];

  return <main className="workspace-page">
    <PageHead eyebrow="Historical evidence + scenario simulation" title="Deployment performance" copy={`Historical totals and risk weights come from the supplied Nagpur 20-junction workbook. Deployment and ${data?.assumedSpeedKmh ?? 24} km/h travel-time values are simulated estimates, not measured police outcomes.`} />
    {error
      ? <div className="error-banner" role="alert">{error}</div>
      : data
        ? <>
          <section className="comparison-grid historical-summary">
            <HistoricalMetric label="Workbook junctions" value={data.historicalJunctionCount} detail="20 selected historical locations" />
            <HistoricalMetric label="Historical crashes" value={data.historicalCrashTotal} detail="Source-reported workbook total" />
            <HistoricalMetric label="Historical fatalities" value={data.historicalFatalityTotal} detail="Source-reported workbook total" />
            <HistoricalMetric label="Weighted severity" value={data.historicalWeightedSeverityTotal} detail={`${data.historicalTierCounts.CRITICAL ?? 0} critical · ${data.historicalTierCounts.HIGH ?? 0} high · ${data.historicalTierCounts.MEDIUM ?? 0} medium · ${data.historicalTierCounts.ELEVATED ?? 0} elevated`} />
          </section>
          <section className="comparison-grid deployment-summary" style={{ marginTop: 13 }}>
            <Comparison label="Historical high-risk staffing" before={data.staticHighRiskCoverage} after={data.recommendedHighRiskCoverage} suffix="%" />
            <Comparison label="Unmanned historical high-risk" before={data.staticUnmannedCount} after={data.recommendedUnmannedCount} />
            <Comparison label="Estimated response" before={data.staticResponseTime} after={data.recommendedResponseTime} suffix=" min" />
            <Comparison label="Historical-risk-weighted staffing" before={data.staticRiskWeightedCoverage} after={data.recommendedRiskWeightedCoverage} suffix="%" />
          </section>
          <section className="analytics-card">
            <div className="card-head"><div><span className="eyebrow">Current deployment vs recommendation</span><h2>Historical-risk staffing model</h2></div><span className="scenario-pill">{data.officerMovementCount} OFFICER{data.officerMovementCount === 1 ? '' : 'S'} RECOMMENDED · SIMULATED</span></div>
            <div className="chart-host">
              <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={300}>
                <BarChart data={chart} margin={{ top: 28, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid stroke="#21343f" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#8da0ab', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} unit="%" tick={{ fill: '#718793', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(79, 209, 179, 0.06)' }} formatter={(value: number) => [`${value}%`]} contentStyle={{ background: '#0d1a23', border: '1px solid #2a3d48', borderRadius: 10 }} />
                  <Legend />
                  <Bar dataKey="Current" fill="#516b79" radius={[5, 5, 0, 0]} minPointSize={3}><LabelList dataKey="Current" position="top" formatter={(value: number) => `${value}%`} fill="#8da0ab" fontSize={11} /></Bar>
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

function HistoricalMetric({ label, value, detail }: { label: string; value: number; detail: string }) {
  return <article className="comparison"><span>{label}</span><div><strong>{value}</strong></div><small>{detail}</small></article>;
}
