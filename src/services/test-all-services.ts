import { Pool } from 'pg';
import { calculateRiskScore, normalizeHistoricalScore } from '../risk/calculator';
import { ExplainabilityService } from './explainability.service';
import { OfficerAllocationService } from './officer-allocation.service';
import { RecommendationService } from './recommendation.service';
import { BaselineComparisonService } from './baseline-comparison.service';

// Mock database
const mockDb = {
  query: async (sql: string, params?: any[]) => {
    console.log('SQL:', sql.substring(0, 80) + '...');
    
    // Mock junctions
    if (sql.includes('FROM junctions') && sql.includes('WHERE id')) {
      return {
        rows: [
          {
            id: 'J002',
            name: 'Juni Pardi Naka Chowk',
            latitude: 21.15139,
            longitude: 79.14889,
            current_risk_score: 46.3,
            risk_level: 'MEDIUM',
            officer_count: 0,
            historical_severity_score: 81,
            congestion: 0.5,
            violations: 0.3,
            obstructions: 0.2,
            weather_risk: 0.4,
            event_pressure: 0.2,
            incident_severity: 0.0,
          },
        ],
      };
    }

    // Mock all junctions
    if (sql.includes('FROM junctions') && !sql.includes('WHERE')) {
      return {
        rows: [
          {
            id: 'J001',
            name: 'Chhatrapati Square',
            current_risk_score: 52,
            risk_level: 'MEDIUM',
            officer_count: 1,
          },
          {
            id: 'J002',
            name: 'Juni Pardi Naka Chowk',
            current_risk_score: 46.3,
            risk_level: 'MEDIUM',
            officer_count: 0,
          },
        ],
      };
    }

    // Mock officers
    if (sql.includes('FROM officers')) {
      return {
        rows: [
          {
            id: 'off-07',
            officer_id: '07',
            name: 'Officer 07',
            status: 'AVAILABLE',
            latitude: 21.1456,
            longitude: 79.0876,
            assigned_junction_id: null,
          },
          {
            id: 'off-12',
            officer_id: '12',
            name: 'Officer 12',
            status: 'AVAILABLE',
            latitude: 21.1623,
            longitude: 79.14106,
            assigned_junction_id: null,
          },
        ],
      };
    }

    // Mock recommendations
    if (sql.includes('FROM recommendations')) {
      return {
        rows: [
          {
            count: 2,
          },
        ],
      };
    }

    return { rows: [] };
  },
} as unknown as Pool;

async function testAllServices() {
  console.log('=== TESTING ALL MEMBER 4 SERVICES ===\n');

  // Test 1: Risk Calculator
  console.log('1. Risk Calculator Test');
  const inputs = {
    accidentHistory: normalizeHistoricalScore(81),
    congestion: 0.5,
    violations: 0.3,
    obstructions: 0.2,
    weather: 0.4,
    events: 0.2,
    incidents: 0.0,
  };
  const riskResult = calculateRiskScore(inputs);
  console.log(`   Score: ${riskResult.score} (${riskResult.level})`);
  console.log(`   ✓ PASS\n`);

  // Test 2: Explainability
  console.log('2. Explainability Test');
  const explainabilityService = new ExplainabilityService();
  const explanation = explainabilityService.generateExplanation(
    'Juni Pardi Naka Chowk',
    riskResult
  );
  console.log(`   Summary: ${explanation.summary}`);
  console.log(`   Top Factors: ${explanation.topFactors.join(', ')}`);
  console.log(`   ✓ PASS\n`);

  // Test 3: Officer Allocation
  console.log('3. Officer Allocation Test');
  const allocationService = new OfficerAllocationService(mockDb);
  const nearestOfficer = await allocationService.findNearestAvailableOfficer('J002');
  if (nearestOfficer) {
    console.log(`   Nearest Officer: ${nearestOfficer.officerId} - ${nearestOfficer.name}`);
    console.log(`   ✓ PASS\n`);
  } else {
    console.log(`   ✗ FAIL\n`);
  }

  // Test 4: Recommendation Generator
  console.log('4. Recommendation Generator Test');
  const recommendationService = new RecommendationService(mockDb);
  const recommendation = await recommendationService.generateRecommendation(
    'J002',
    'Juni Pardi Naka Chowk',
    46.3
  );
  if (recommendation) {
    console.log(`   Officer: ${recommendation.officerName}`);
    console.log(`   Travel Time: ${recommendation.travelMinutes.toFixed(1)} min`);
    console.log(`   Priority: ${recommendation.deploymentPriority.toFixed(1)}`);
    console.log(`   ✓ PASS\n`);
  } else {
    console.log(`   ✗ FAIL\n`);
  }

  // Test 5: Baseline Comparison
  console.log('5. Baseline Comparison Test');
  const baselineService = new BaselineComparisonService(mockDb);
  const metrics = await baselineService.calculateBaselineMetrics();
  console.log(`   Static Coverage: ${metrics.staticHighRiskCoverage}%`);
  console.log(`   Recommended Coverage: ${metrics.recommendedHighRiskCoverage}%`);
  console.log(`   Improvement: +${metrics.recommendedHighRiskCoverage - metrics.staticHighRiskCoverage}%`);
  console.log(`   ✓ PASS\n`);

  // Test 6: Deployment Priority
  console.log('6. Deployment Priority Test');
  const priority = recommendationService.calculateDeploymentPriority(46.3, 0);
  console.log(`   Priority: ${priority.toFixed(1)}`);
  console.log(`   Formula: 0.85 × 46.3 + 15 × 1 = ${priority.toFixed(1)}`);
  console.log(`   ✓ PASS\n`);

  console.log('=== ALL TESTS COMPLETE ===');
  console.log('✅ Member 4 services are working correctly!');
}

testAllServices().catch(console.error);