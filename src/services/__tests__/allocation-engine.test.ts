import { normalizedCoverageGap, rankAvailableOfficers } from '../allocation-engine';

describe('allocation engine', () => {
  test('coverage gap is normalized and handles zero required officers', () => {
    expect(normalizedCoverageGap(0, 3)).toBe(0);
    expect(normalizedCoverageGap(4, 1)).toBe(0.75);
    expect(normalizedCoverageGap(2, 5)).toBe(0);
  });

  test('excludes busy officers and ranks the nearest available officer first', () => {
    const ranked = rankAvailableOfficers({ latitude: 21.1458, longitude: 79.0882 }, [
      { latitude: 21.15, longitude: 79.09, status: 'BUSY', assignments_completed: 0 },
      { latitude: 21.30, longitude: 79.20, status: 'AVAILABLE', assignments_completed: 0 },
      { latitude: 21.146, longitude: 79.088, status: 'AVAILABLE', assignments_completed: 5 },
    ]);
    expect(ranked).toHaveLength(2);
    expect(ranked[0].latitude).toBe(21.146);
    expect(rankAvailableOfficers({ latitude: 0, longitude: 0 }, [])).toEqual([]);
  });
});
