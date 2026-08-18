type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export function determineRiskLevel(score: number): RiskLevel {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 35) return 'MEDIUM';
  return 'LOW';
}

export function isValidRiskLevel(level: string): boolean {
  return ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(level);
}

export function getRiskLevelColor(level: RiskLevel): string {
  switch (level) {
    case 'CRITICAL':
      return '#DC2626';
    case 'HIGH':
      return '#EA580C';
    case 'MEDIUM':
      return '#EAB308';
    case 'LOW':
      return '#16A34A';
    default:
      return '#6B7280';
  }
}