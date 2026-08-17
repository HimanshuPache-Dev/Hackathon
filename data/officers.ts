export interface Officer {
  id: string;
  name: string;
  badgeCode: string;
  status: "AVAILABLE" | "DEPLOYED" | "ON_PATROL" | "OFF_DUTY";
  currentJunctionId: string;
}

export const officers: Officer[] = [
  {
    id: "O01",
    name: "Aarav Sharma",
    badgeCode: "NGP-001",
    status: "AVAILABLE",
    currentJunctionId: "J010",
  },
  {
    id: "O02",
    name: "Neha Verma",
    badgeCode: "NGP-002",
    status: "DEPLOYED",
    currentJunctionId: "J003",
  },
  {
    id: "O03",
    name: "Rohit Deshmukh",
    badgeCode: "NGP-003",
    status: "ON_PATROL",
    currentJunctionId: "J001",
  },
  {
    id: "O04",
    name: "Priya Nair",
    badgeCode: "NGP-004",
    status: "AVAILABLE",
    currentJunctionId: "J007",
  },
  {
    id: "O05",
    name: "Karan Singh",
    badgeCode: "NGP-005",
    status: "DEPLOYED",
    currentJunctionId: "J005",
  },
  {
    id: "O06",
    name: "Sneha Kulkarni",
    badgeCode: "NGP-006",
    status: "ON_PATROL",
    currentJunctionId: "J014",
  },
  {
    id: "O07",
    name: "Vikram Patil",
    badgeCode: "NGP-007",
    status: "AVAILABLE",
    currentJunctionId: "J009",
  },
  {
    id: "O08",
    name: "Ananya Joshi",
    badgeCode: "NGP-008",
    status: "DEPLOYED",
    currentJunctionId: "J012",
  },
  {
    id: "O09",
    name: "Rahul Bhosale",
    badgeCode: "NGP-009",
    status: "AVAILABLE",
    currentJunctionId: "J016",
  },
  {
    id: "O10",
    name: "Meera Kapoor",
    badgeCode: "NGP-010",
    status: "ON_PATROL",
    currentJunctionId: "J004",
  },
  {
    id: "O11",
    name: "Aditya Choudhary",
    badgeCode: "NGP-011",
    status: "DEPLOYED",
    currentJunctionId: "J018",
  },
  {
    id: "O12",
    name: "Pooja Shinde",
    badgeCode: "NGP-012",
    status: "AVAILABLE",
    currentJunctionId: "J002",
  },
  {
    id: "O13",
    name: "Nikhil Rao",
    badgeCode: "NGP-013",
    status: "OFF_DUTY",
    currentJunctionId: "J020",
  },
  {
    id: "O14",
    name: "Ishita Mehta",
    badgeCode: "NGP-014",
    status: "DEPLOYED",
    currentJunctionId: "J006",
  },
  {
    id: "O15",
    name: "Sandeep Yadav",
    badgeCode: "NGP-015",
    status: "AVAILABLE",
    currentJunctionId: "J011",
  },
];
