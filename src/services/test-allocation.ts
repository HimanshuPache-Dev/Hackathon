import { Pool } from 'pg';
import { AllocationService } from './allocation.service';

// Mock database for testing (replace with real connection later)
const mockDb = {
  query: async (sql: string, params?: any[]) => {
    console.log('SQL:', sql);
    console.log('Params:', params);
    
    // Mock data for testing
    return {
      rows: [
        {
          id: 'J002',
          name: 'Juni Pardi Naka Chowk',
          current_risk_score: 46.3,
          risk_level: 'MEDIUM',
          officer_count: 0,
          latitude: 21.15139,
          longitude: 79.14889,
        },
        {
          id: 'J001',
          name: 'Chhatrapati Square',
          current_risk_score: 52,
          risk_level: 'MEDIUM',
          officer_count: 0,
          latitude: 21.11083,
          longitude: 79.07011,
        },
      ],
    };
  },
} as unknown as Pool;

async function testAllocation() {
  const allocationService = new AllocationService(mockDb);

  console.log('=== Unmanned High-Risk Detection Test ===\n');

  const unmanned = await allocationService.detectUnmannedHighRisk();

  console.log(`Found ${unmanned.length} unmanned high-risk junctions:\n`);

  for (const junction of unmanned) {
    console.log(`${junction.junctionId}: ${junction.name}`);
    console.log(`  Risk Score: ${junction.riskScore} (${junction.riskLevel})`);
    console.log(`  Officer Count: ${junction.officerCount}`);
    console.log(`  Coordinates: ${junction.latitude}, ${junction.longitude}`);
    console.log('');
  }

  // Test single junction check
  const isUnmanned = await allocationService.isUnmannedHighRisk('J002');
  console.log(`J002 is unmanned high-risk: ${isUnmanned}`);
}

testAllocation().catch(console.error);