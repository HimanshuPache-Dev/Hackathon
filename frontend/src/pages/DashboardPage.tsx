import { useEffect, useState } from 'react';
import { junctionsAPI, officersAPI, baselineAPI, incidentsAPI } from '../services/api';
import { Junction, Officer, BaselineMetrics } from '../types';
import { MapPin, Users, AlertTriangle, TrendingUp, Clock, Shield } from 'lucide-react';

function DashboardPage() {
  const [junctions, setJunctions] = useState<Junction[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [baseline, setBaseline] = useState<BaselineMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [junctionsRes, officersRes, baselineRes] = await Promise.all([
        junctionsAPI.getAll(),
        officersAPI.getAll(),
        baselineAPI.getMetrics(),
      ]);

      setJunctions(junctionsRes.data.data);
      setOfficers(officersRes.data.data);
      setBaseline(baselineRes.data.data.metrics);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateIncident = async () => {
    try {
      await incidentsAPI.simulate({
        junctionId: 'J002',
        severity: 'CRITICAL',
      });
      loadData();
      alert('✅ Incident simulated at Juni Pardi Naka Chowk!');
    } catch (error) {
      console.error('Error simulating incident:', error);
      alert('❌ Failed to simulate incident');
    }
  };

  const highRiskJunctions = junctions.filter((j) => j.current_risk_score >= 60);
  const criticalJunctions = junctions.filter((j) => j.risk_level === 'CRITICAL');
  const availableOfficers = officers.filter((o) => o.status === 'AVAILABLE');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">🚔 Nagpur SafeFlow</h1>
              <p className="text-blue-200 text-sm">Commander Dashboard</p>
            </div>
            <button
              onClick={handleSimulateIncident}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              ⚠️ Simulate Incident
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            icon={<MapPin className="w-6 h-6" />}
            title="Total Junctions"
            value={junctions.length.toString()}
            color="bg-blue-500"
          />
          <MetricCard
            icon={<AlertTriangle className="w-6 h-6" />}
            title="High Risk"
            value={highRiskJunctions.length.toString()}
            color="bg-red-500"
          />
          <MetricCard
            icon={<Users className="w-6 h-6" />}
            title="Available Officers"
            value={availableOfficers.length.toString()}
            color="bg-green-500"
          />
          <MetricCard
            icon={<Shield className="w-6 h-6" />}
            title="Coverage"
            value={baseline ? `${baseline.recommendedHighRiskCoverage}%` : '-'}
            color="bg-purple-500"
          />
        </div>

        {/* Baseline Comparison */}
        {baseline && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              AI Impact Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Static Coverage</p>
                <p className="text-2xl font-bold text-blue-900">
                  {baseline.staticHighRiskCoverage}%
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">AI Recommended</p>
                <p className="text-2xl font-bold text-green-900">
                  {baseline.recommendedHighRiskCoverage}%
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Improvement</p>
                <p className="text-2xl font-bold text-purple-900">
                  +{baseline.recommendedHighRiskCoverage - baseline.staticHighRiskCoverage}%
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600 italic">
              {baseline.summary}
            </p>
          </div>
        )}

        {/* High Risk Junctions Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
            High Risk Junctions
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Junction</th>
                  <th className="text-left py-2 px-4">Risk Score</th>
                  <th className="text-left py-2 px-4">Level</th>
                  <th className="text-left py-2 px-4">Officers</th>
                  <th className="text-left py-2 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {highRiskJunctions.map((junction) => (
                  <tr key={junction.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{junction.name}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold">{junction.current_risk_score}</span>
                    </td>
                    <td className="py-3 px-4">
                      <RiskBadge level={junction.risk_level} />
                    </td>
                    <td className="py-3 px-4">{junction.officer_count}</td>
                    <td className="py-3 px-4">
                      {junction.officer_count === 0 ? (
                        <span className="text-red-600 font-semibold">⚠️ Unmanned</span>
                      ) : (
                        <span className="text-green-600">✅ Covered</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

// Metric Card Component
function MetricCard({ icon, title, value, color }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex items-center">
      <div className={`${color} text-white p-3 rounded-lg mr-4`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

// Risk Badge Component
function RiskBadge({ level }: { level: string }) {
  const colors: any = {
    LOW: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    CRITICAL: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[level]}`}>
      {level}
    </span>
  );
}

export default DashboardPage;