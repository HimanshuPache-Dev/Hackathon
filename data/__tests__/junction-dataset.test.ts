import { junctionDatasetSummary, junctions } from '../junctions';

describe('PoliceOps historical junction dataset', () => {
  test('matches the supplied workbook totals and tier distribution', () => {
    expect(junctionDatasetSummary).toEqual({
      junctionCount: 20,
      historicalCrashes: 466,
      fatalities: 124,
      majorInjuries: 361,
      minorInjuries: 73,
      weightedSeverity: 1776,
      tiers: { CRITICAL: 4, HIGH: 6, MEDIUM: 6, ELEVATED: 4 },
    });
  });

  test.each(junctions)('$id uses the workbook weighted-severity formula', (junction) => {
    expect(junction.weightedSeverity).toBe(
      (5 * junction.fatalities) + (3 * junction.majorInjuries) + junction.minorInjuries,
    );
  });

  test('contains unique IDs, ranks all records, and keeps coordinates in Nagpur bounds', () => {
    expect(new Set(junctions.map(({ id }) => id)).size).toBe(20);
    expect(junctions.every(({ priorityRank }) => priorityRank >= 1 && priorityRank <= 20)).toBe(true);
    expect(junctions.every(({ latitude, longitude }) => (
      latitude >= 20.9 && latitude <= 21.3 && longitude >= 78.8 && longitude <= 79.3
    ))).toBe(true);
  });
});
