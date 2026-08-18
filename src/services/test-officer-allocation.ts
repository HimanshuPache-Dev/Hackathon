import { OfficerAllocationService } from './officer-allocation.service';

// Mock database
const mockDb = {
  query: async (sql: string, params?: any[]) => {
    console.log('SQL:', sql.substring(0, 50) + '...');
    console.log('Params:', params);

    // Mock junction data
    if (sql.includes('FROM junctions')) {
      return {
        rows: [
          {
            latitude: 21.15139,
            longitude: 79.14889,
          },
        ],
      };
    }

    // Mock officers data
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

    return { rows: [] };
  },
} as any;

async function testAllocation() {
  const service = new OfficerAllocationService(mockDb);

  console.log('=== Officer Allocation Test ===\n');

  // Test 1: Find nearest officer
  console.log('Test 1: Find Nearest Officer to J002 (Juni Pardi Naka Chowk)');
  const nearestOfficer = await service.findNearestAvailableOfficer('J002');

  if (nearestOfficer) {
    console.log(`✓ Found: ${nearestOfficer.officerId} - ${nearestOfficer.name}`);
    console.log(`  Status: ${nearestOfficer.status}`);
    console.log(`  Location: ${nearestOfficer.latitude}, ${nearestOfficer.longitude}`);
  } else {
    console.log('✗ No available officer found');
  }
  console.log('');

  // Test 2: Generate recommendation
  console.log('Test 2: Generate Deployment Recommendation');
  const recommendation = await service.generateRecommendation(
    'J002',
    'Juni Pardi Naka Chowk',
    46.3
  );

  if (recommendation) {
    console.log(`✓ Recommendation generated:`);
    console.log(`  Officer: ${recommendation.officerName}`);
    console.log(`  Distance: ${recommendation.distanceKm.toFixed(2)} km`);
    console.log(`  Travel Time: ${recommendation.estimatedTravelTimeMinutes.toFixed(1)} min`);
    console.log(`  Reasons:`);
    recommendation.reasons.forEach((reason, i) => {
      console.log(`    ${i + 1}. ${reason}`);
    });
  } else {
    console.log('✗ Could not generate recommendation');
  }
  console.log('');

  // Test 3: Haversine distance calculation
  console.log('Test 3: Haversine Distance Calculation');
  const distance = service.calculateDistance(
    21.15139, // Juni Pardi Naka
    79.14889,
    21.1456, // Officer 07
    79.0876
  );
  console.log(`  Distance: ${distance.toFixed(2)} km`);
  console.log(`  Expected: ~5-6 km (approximate)`);
}

testAllocation().catch(console.error);