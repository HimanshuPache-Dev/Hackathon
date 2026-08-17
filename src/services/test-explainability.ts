import { calculateRiskScore } from '../risk/calculator';
import { ExplainabilityService } from './explainability.service';

const explainabilityService = new ExplainabilityService();

// Test case 1: High risk junction
console.log('=== Test 1: High Risk Junction ===');
const inputs1 = {
  accidentHistory: 0.85,
  congestion: 0.90,
  violations: 0.60,
  obstructions: 0.40,
  weather: 0.40,
  events: 0.30,
  incidents: 0.87,
};

const result1 = calculateRiskScore(inputs1);
const explanation1 = explainabilityService.generateExplanation(
  'Juni Pardi Naka Chowk',
  result1
);

console.log('Score:', explanation1.score);
console.log('Level:', explanation1.riskLevel);
console.log('Top Factors:', explanation1.topFactors);
console.log('Summary:', explanation1.summary);
console.log('');

// Test case 2: Low risk junction
console.log('=== Test 2: Low Risk Junction ===');
const inputs2 = {
  accidentHistory: 0.20,
  congestion: 0.10,
  violations: 0.10,
  obstructions: 0.0,
  weather: 0.0,
  events: 0.0,
  incidents: 0.0,
};

const result2 = calculateRiskScore(inputs2);
const explanation2 = explainabilityService.generateExplanation(
  'Quiet Street Junction',
  result2
);

console.log('Score:', explanation2.score);
console.log('Level:', explanation2.riskLevel);
console.log('Top Factors:', explanation2.topFactors);
console.log('Summary:', explanation2.summary);
console.log('');

// Test case 3: Comparison explanation
console.log('=== Test 3: Comparison Explanation ===');
const comparison = explainabilityService.generateComparisonExplanation(
  'Juni Pardi Naka Chowk',
  73.2,
  87.3,
  'HIGH',
  'CRITICAL'
);

console.log('Comparison:', comparison);
