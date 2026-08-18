/**
 * ==========================================================
 * SIMULATED OFFICER TRAVEL TIME DATA
 * ----------------------------------------------------------
 * These travel times are fictional and intended only for
 * AI testing, officer allocation, routing simulation,
 * and application demonstrations.
 * ==========================================================
 */

export interface TravelTime {
  officerId: string;
  junctionId: string;
  travelMinutes: number;
}

export const travelTimes: TravelTime[] = [
  // ---------- Junction J001 ----------
  { officerId: "O03", junctionId: "J001", travelMinutes: 2 },
  { officerId: "O02", junctionId: "J001", travelMinutes: 4 },
  { officerId: "O12", junctionId: "J001", travelMinutes: 6 },

  // ---------- Junction J002 ----------
  { officerId: "O12", junctionId: "J002", travelMinutes: 2 },
  { officerId: "O02", junctionId: "J002", travelMinutes: 4 },
  { officerId: "O15", junctionId: "J002", travelMinutes: 7 },

  // ---------- Junction J003 ----------
  { officerId: "O02", junctionId: "J003", travelMinutes: 1 },
  { officerId: "O10", junctionId: "J003", travelMinutes: 5 },
  { officerId: "O01", junctionId: "J003", travelMinutes: 8 },

  // ---------- Junction J004 ----------
  { officerId: "O10", junctionId: "J004", travelMinutes: 3 },
  { officerId: "O06", junctionId: "J004", travelMinutes: 6 },
  { officerId: "O11", junctionId: "J004", travelMinutes: 8 },

  // ---------- Junction J005 ----------
  { officerId: "O05", junctionId: "J005", travelMinutes: 1 },
  { officerId: "O08", junctionId: "J005", travelMinutes: 5 },
  { officerId: "O14", junctionId: "J005", travelMinutes: 7 },

  // ---------- Junction J006 ----------
  { officerId: "O14", junctionId: "J006", travelMinutes: 2 },
  { officerId: "O05", junctionId: "J006", travelMinutes: 4 },
  { officerId: "O06", junctionId: "J006", travelMinutes: 6 },

  // ---------- Junction J007 ----------
  { officerId: "O04", junctionId: "J007", travelMinutes: 1 },
  { officerId: "O07", junctionId: "J007", travelMinutes: 4 },
  { officerId: "O09", junctionId: "J007", travelMinutes: 7 },

  // ---------- Junction J008 ----------
  { officerId: "O08", junctionId: "J008", travelMinutes: 3 },
  { officerId: "O04", junctionId: "J008", travelMinutes: 5 },
  { officerId: "O07", junctionId: "J008", travelMinutes: 6 },

  // ---------- Junction J009 ----------
  { officerId: "O07", junctionId: "J009", travelMinutes: 2 },
  { officerId: "O09", junctionId: "J009", travelMinutes: 3 },
  { officerId: "O15", junctionId: "J009", travelMinutes: 6 },

  // ---------- Junction J010 ----------
  { officerId: "O01", junctionId: "J010", travelMinutes: 1 },
  { officerId: "O07", junctionId: "J010", travelMinutes: 4 },
  { officerId: "O15", junctionId: "J010", travelMinutes: 5 },

  // ---------- Junction J011 ----------
  { officerId: "O15", junctionId: "J011", travelMinutes: 1 },
  { officerId: "O09", junctionId: "J011", travelMinutes: 4 },
  { officerId: "O04", junctionId: "J011", travelMinutes: 6 },

  // ---------- Junction J012 ----------
  { officerId: "O08", junctionId: "J012", travelMinutes: 1 },
  { officerId: "O05", junctionId: "J012", travelMinutes: 5 },
  { officerId: "O02", junctionId: "J012", travelMinutes: 8 },

  // ---------- Junction J013 ----------
  { officerId: "O13", junctionId: "J013", travelMinutes: 2 },
  { officerId: "O15", junctionId: "J013", travelMinutes: 5 },
  { officerId: "O01", junctionId: "J013", travelMinutes: 7 },

  // ---------- Junction J014 ----------
  { officerId: "O06", junctionId: "J014", travelMinutes: 1 },
  { officerId: "O08", junctionId: "J014", travelMinutes: 4 },
  { officerId: "O10", junctionId: "J014", travelMinutes: 6 },

  // ---------- Junction J015 ----------
  { officerId: "O11", junctionId: "J015", travelMinutes: 2 },
  { officerId: "O06", junctionId: "J015", travelMinutes: 5 },
  { officerId: "O03", junctionId: "J015", travelMinutes: 7 },

  // ---------- Junction J016 ----------
  { officerId: "O09", junctionId: "J016", travelMinutes: 1 },
  { officerId: "O07", junctionId: "J016", travelMinutes: 4 },
  { officerId: "O15", junctionId: "J016", travelMinutes: 5 },

  // ---------- Junction J017 ----------
  { officerId: "O03", junctionId: "J017", travelMinutes: 3 },
  { officerId: "O04", junctionId: "J017", travelMinutes: 6 },
  { officerId: "O01", junctionId: "J017", travelMinutes: 8 },

  // ---------- Junction J018 ----------
  { officerId: "O11", junctionId: "J018", travelMinutes: 1 },
  { officerId: "O14", junctionId: "J018", travelMinutes: 3 },
  { officerId: "O06", junctionId: "J018", travelMinutes: 6 },

  // ---------- Junction J019 ----------
  { officerId: "O13", junctionId: "J019", travelMinutes: 2 },
  { officerId: "O11", junctionId: "J019", travelMinutes: 4 },
  { officerId: "O14", junctionId: "J019", travelMinutes: 5 },

  // ---------- Junction J020 ----------
  { officerId: "O13", junctionId: "J020", travelMinutes: 1 },
  { officerId: "O11", junctionId: "J020", travelMinutes: 3 },
  { officerId: "O14", junctionId: "J020", travelMinutes: 4 },
];