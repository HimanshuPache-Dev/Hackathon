import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CommandLayout from './components/CommandLayout';
const LoginPage=lazy(()=>import('./pages/LoginPage'));
const DashboardPage=lazy(()=>import('./pages/DashboardPage'));
const JunctionDetailsPage=lazy(()=>import('./pages/JunctionDetailsPage'));
const RecommendationsPage=lazy(()=>import('./pages/RecommendationsPage'));
const IncidentsPage=lazy(()=>import('./pages/IncidentsPage'));
const AnalyticsPage=lazy(()=>import('./pages/AnalyticsPage'));
const AuditPage=lazy(()=>import('./pages/AuditPage'));
const PlannerPage=lazy(()=>import('./pages/PlannerPage'));

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Suspense fallback={<div style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#071019',color:'#78909d'}}>Loading command module…</div>}><Routes>
        <Route path="/" element={<LoginPage />} />
        <Route element={<CommandLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/incidents" element={<IncidentsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/audit" element={<AuditPage />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/junction/:id" element={<JunctionDetailsPage />} />
        </Route>
      </Routes></Suspense>
    </BrowserRouter>
  );
}

export default App;
