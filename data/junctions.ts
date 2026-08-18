export interface Junction {
  id: string;
  locationName: string;
  latitude: number;
  longitude: number;
  historicalCrashes: number;
  fatalities: number;
  majorInjuries: number;
  minorInjuries: number;
  weightedSeverity: number;
  historicalScore: number;
  priorityRank: number;
  riskTier: string;
  confidenceLevel: string;
  sourceUrl: string;
}

export const junctions: Junction[] = [
  {
    id: "J001",
    locationName: "Chhatrapati Square",
    latitude: 21.11083,
    longitude: 79.07011,
    historicalCrashes: 45,
    fatalities: 12,
    majorInjuries: 37,
    minorInjuries: 9,
    weightedSeverity: 180,
    historicalScore: 100,
    priorityRank: 1,
    riskTier: "CRITICAL",
    confidenceLevel: "PASS",
    sourceUrl: "https://www.thehitavada.com/Encyc/2024/12/10/Prakash-High-School-to-Kapsi-Bridge-MarutiShowroom-sq-among.html"
  },
  {
    id: "J002",
    locationName: "Juni Pardi Naka Chowk",
    latitude: 21.15139,
    longitude: 79.14889,
    historicalCrashes: 33,
    fatalities: 13,
    majorInjuries: 25,
    minorInjuries: 6,
    weightedSeverity: 146,
    historicalScore: 81,
    priorityRank: 2,
    riskTier: "CRITICAL",
    confidenceLevel: "PASS",
    sourceUrl: "https://www.thehitavada.com/Encyc/2024/12/10/Prakash-High-School-to-Kapsi-Bridge-MarutiShowroom-sq-among.html"
  },
  {
    id: "J003",
    locationName: "Jhansi Rani Square",
    latitude: 21.14124,
    longitude: 79.08029,
    historicalCrashes: 41,
    fatalities: 7,
    majorInjuries: 35,
    minorInjuries: 5,
    weightedSeverity: 145,
    historicalScore: 81,
    priorityRank: 3,
    riskTier: "CRITICAL",
    confidenceLevel: "PASS",
    sourceUrl: "https://timesofindia.indiatimes.com/city/nagpur/traffic-chaos-at-jhansi-rani-square-in-nagpur/articleshow/113175497.cms"
  },
  {
    id: "J004",
    locationName: "Jingabai Takli to Zhanda Chowk",
    latitude: 21.18761,
    longitude: 79.07888,
    historicalCrashes: 39,
    fatalities: 12,
    majorInjuries: 25,
    minorInjuries: 8,
    weightedSeverity: 143,
    historicalScore: 79,
    priorityRank: 4,
    riskTier: "CRITICAL",
    confidenceLevel: "PASS",
    sourceUrl: "https://www.inai.ai/img/docs/iraste-nagpur/iRASATE-Detailed-Report.pdf"
  },
  {
    id: "J005",
    locationName: "Chikli Square",
    latitude: 21.16230,
    longitude: 79.14106,
    historicalCrashes: 31,
    fatalities: 14,
    majorInjuries: 18,
    minorInjuries: 5,
    weightedSeverity: 129,
    historicalScore: 72,
    priorityRank: 5,
    riskTier: "HIGH",
    confidenceLevel: "PASS",
    sourceUrl: "https://timesofindia.indiatimes.com/city/nagpur/chikhli-square-flyover-turns-pothole-maze/articleshow/123210667.cms"
  },
  {
    id: "J006",
    locationName: "Maruti Seva Square, Kamptee Road",
    latitude: 21.18391,
    longitude: 79.11693,
    historicalCrashes: 27,
    fatalities: 11,
    majorInjuries: 19,
    minorInjuries: 2,
    weightedSeverity: 114,
    historicalScore: 63,
    priorityRank: 6,
    riskTier: "HIGH",
    confidenceLevel: "PASS",
    sourceUrl: "https://www.thehitavada.com/Encyc/2024/12/10/Prakash-High-School-to-Kapsi-Bridge-MarutiShowroom-sq-among.html"
  },
  {
    id: "J007",
    locationName: "Shitla Mata Square",
    latitude: 21.12194,
    longitude: 79.12111,
    historicalCrashes: 27,
    fatalities: 6,
    majorInjuries: 27,
    minorInjuries: 3,
    weightedSeverity: 114,
    historicalScore: 63,
    priorityRank: 6,
    riskTier: "HIGH",
    confidenceLevel: "PASS",
    sourceUrl: "https://www.inai.ai/img/docs/iraste-nagpur/iRASATE-Detailed-Report.pdf"
  },
  {
    id: "J008",
    locationName: "Kharbi Chowk",
    latitude: 21.12425,
    longitude: 79.13848,
    historicalCrashes: 21,
    fatalities: 6,
    majorInjuries: 16,
    minorInjuries: 4,
    weightedSeverity: 82,
    historicalScore: 46,
    priorityRank: 8,
    riskTier: "HIGH",
    confidenceLevel: "PASS",
    sourceUrl: "https://www.inai.ai/img/docs/iraste-nagpur/iRASATE-Detailed-Report.pdf"
  },
  {
    id: "J009",
    locationName: "Mhalgi Nagar Square",
    latitude: 21.10766,
    longitude: 79.11961,
    historicalCrashes: 18,
    fatalities: 4,
    majorInjuries: 18,
    minorInjuries: 1,
    weightedSeverity: 75,
    historicalScore: 42,
    priorityRank: 9,
    riskTier: "HIGH",
    confidenceLevel: "PASS",
    sourceUrl: "https://www.thehitavada.com/Encyc/2024/12/10/Prakash-High-School-to-Kapsi-Bridge-MarutiShowroom-sq-among.html"
  },
  {
    id: "J010",
    locationName: "Ravi Nagar",
    latitude: 21.14744,
    longitude: 79.05620,
    historicalCrashes: 26,
    fatalities: 5,
    majorInjuries: 14,
    minorInjuries: 7,
    weightedSeverity: 74,
    historicalScore: 41,
    priorityRank: 10,
    riskTier: "HIGH",
    confidenceLevel: "PASS",
    sourceUrl: "https://www.inai.ai/img/docs/iraste-nagpur/iRASATE-Detailed-Report.pdf"
  },
  {
    id: "J011",
    locationName: "Manewada Square",
    latitude: 21.10522,
    longitude: 79.10247,
    historicalCrashes: 18,
    fatalities: 2,
    majorInjuries: 19,
    minorInjuries: 3,
    weightedSeverity: 70,
    historicalScore: 39,
    priorityRank: 11,
    riskTier: "MEDIUM",
    confidenceLevel: "PASS",
    sourceUrl: "https://www.thehitavada.com/Encyc/2024/12/10/Prakash-High-School-to-Kapsi-Bridge-MarutiShowroom-sq-among.html"
  },
  {
    id: "J012",
    locationName: "Chinchbhavan Square",
    latitude: 21.06750,
    longitude: 79.05833,
    historicalCrashes: 15,
    fatalities: 3,
    majorInjuries: 14,
    minorInjuries: 5,
    weightedSeverity: 62,
    historicalScore: 34,
    priorityRank: 12,
    riskTier: "MEDIUM",
    confidenceLevel: "PASS",
    sourceUrl: "https://www.thehitavada.com/Encyc/2024/12/10/Prakash-High-School-to-Kapsi-Bridge-MarutiShowroom-sq-among.html"
  },
  {
    id: "J013",
    locationName: "Rajiv Nagar Intersection",
    latitude: 21.10365,
    longitude: 78.99068,
    historicalCrashes: 16,
    fatalities: 6,
    majorInjuries: 10,
    minorInjuries: 0,
    weightedSeverity: 60,
    historicalScore: 33,
    priorityRank: 13,
    riskTier: "MEDIUM",
    confidenceLevel: "PASS",
    sourceUrl: "https://www.thehitavada.com/Encyc/2024/12/10/Prakash-High-School-to-Kapsi-Bridge-MarutiShowroom-sq-among.html"
  },
  {
    id: "J014",
    locationName: "Wathoda Square",
    latitude: 21.13361,
    longitude: 79.14333,
    historicalCrashes: 17,
    fatalities: 5,
    majorInjuries: 11,
    minorInjuries: 2,
    weightedSeverity: 60,
    historicalScore: 33,
    priorityRank: 13,
    riskTier: "MEDIUM",
    confidenceLevel: "PASS",
    sourceUrl: "https://www.inai.ai/img/docs/iraste-nagpur/iRASATE-Detailed-Report.pdf"
  },
  {
    id: "J015",
    locationName: "Mayo Square",
    latitude: 21.15317,
    longitude: 79.09403,
    historicalCrashes: 16,
    fatalities: 4,
    majorInjuries: 11,
    minorInjuries: 3,
    weightedSeverity: 56,
    historicalScore: 31,
    priorityRank: 15,
    riskTier: "MEDIUM",
    confidenceLevel: "PASS",
    sourceUrl: "https://www.inai.ai/img/docs/iraste-nagpur/iRASATE-Detailed-Report.pdf"
  },
  {
    id: "J016",
    locationName: "Shrinagar Chowk",
    latitude: 21.10771,
    longitude: 79.07994,
    historicalCrashes: 20,
    fatalities: 2,
    majorInjuries: 14,
    minorInjuries: 3,
    weightedSeverity: 55,
    historicalScore: 31,
    priorityRank: 16,
    riskTier: "MEDIUM",
    confidenceLevel: "PASS",
    sourceUrl: "https://www.inai.ai/img/docs/iraste-nagpur/iRASATE-Detailed-Report.pdf"
  },
  {
    id: "J017",
    locationName: "NEERI Point",
    latitude: 21.11933,
    longitude: 79.06840,
    historicalCrashes: 17,
    fatalities: 2,
    majorInjuries: 14,
    minorInjuries: 2,
    weightedSeverity: 54,
    historicalScore: 30,
    priorityRank: 17,
    riskTier: "ELEVATED",
    confidenceLevel: "PASS",
    sourceUrl: "https://www.inai.ai/img/docs/iraste-nagpur/iRASATE-Detailed-Report.pdf"
  },
  {
    id: "J018",
    locationName: "Gorewada to New Katol Toll Naka",
    latitude: 21.18361,
    longitude: 79.03417,
    historicalCrashes: 15,
    fatalities: 3,
    majorInjuries: 12,
    minorInjuries: 3,
    weightedSeverity: 54,
    historicalScore: 30,
    priorityRank: 17,
    riskTier: "ELEVATED",
    confidenceLevel: "PASS",
    sourceUrl: "https://timesofindia.indiatimes.com/city/nagpur/van-school-bus-crash-puts-spotlight-on-gorewada-mankapur-stretch/articleshow/123874461.cms"
  },
  {
    id: "J019",
    locationName: "Wadi T Point (Dhamna)",
    latitude: 21.15287,
    longitude: 79.00227,
    historicalCrashes: 12,
    fatalities: 3,
    majorInjuries: 12,
    minorInjuries: 1,
    weightedSeverity: 52,
    historicalScore: 29,
    priorityRank: 19,
    riskTier: "ELEVATED",
    confidenceLevel: "PASS",
    sourceUrl: "https://timesofindia.indiatimes.com/city/nagpur/rto-identifies-6-accident-prone-spots-launches-drive-to-curb-fatalities/articleshow/129686851.cms"
  },
  {
    id: "J020",
    locationName: "Auto Hub to Toll Naka",
    latitude: 21.15352,
    longitude: 79.00419,
    historicalCrashes: 12,
    fatalities: 4,
    majorInjuries: 10,
    minorInjuries: 1,
    weightedSeverity: 51,
    historicalScore: 28,
    priorityRank: 20,
    riskTier: "ELEVATED",
    confidenceLevel: "PASS",
    sourceUrl: "https://www.inai.ai/img/docs/iraste-nagpur/iRASATE-Detailed-Report.pdf"
  }
];

/**
 * Source-of-truth notes from nagpur20junctionsriskdataset.xlsx.
 * Crash outcomes and coordinates are source-reported historical FIR evidence.
 * Severity, score, rank, and tier are transparent project-derived values and
 * must not be presented as accident probabilities or current predictions.
 */
export const junctionDatasetProvenance = {
  workbook: 'nagpur20junctionsriskdataset.xlsx',
  worksheet: 'Junctions_20',
  source: 'iRASTE Nagpur Detailed Report, Table 4.3',
  period: 'Historical FIR period; verify exact dates because the report is inconsistent',
  weightedSeverityFormula: '5 × fatalities + 3 × major injuries + 1 × minor injuries',
  mapVerification: 'All 20 workbook rows are marked Verified',
} as const;

export const junctionDatasetSummary = junctions.reduce(
  (summary, junction) => {
    summary.historicalCrashes += junction.historicalCrashes;
    summary.fatalities += junction.fatalities;
    summary.majorInjuries += junction.majorInjuries;
    summary.minorInjuries += junction.minorInjuries;
    summary.weightedSeverity += junction.weightedSeverity;
    summary.tiers[junction.riskTier] = (summary.tiers[junction.riskTier] ?? 0) + 1;
    return summary;
  },
  {
    junctionCount: junctions.length,
    historicalCrashes: 0,
    fatalities: 0,
    majorInjuries: 0,
    minorInjuries: 0,
    weightedSeverity: 0,
    tiers: {} as Record<string, number>,
  },
);
