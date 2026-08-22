export const officerProfile = {
  name: "Jean Claude",
  role: "Youth Officer",
  district: "Gasabo District",
  photo: "/jeanclaude.jpg",
};

export const dashboardStats = [
  {
    label: "Active youth",
    value: "128",
    change: "+12 from last week",
    icon: "users",
    tone: "green",
  },
  {
    label: "New this week",
    value: "16",
    change: "+4 from last week",
    icon: "sparkles",
    tone: "blue",
  },
  {
    label: "Steps completed",
    value: "236",
    change: "+32 this week",
    icon: "trending",
    tone: "purple",
  },
  {
    label: "Pending approvals",
    value: "7",
    change: "Requires your review",
    icon: "clock",
    tone: "amber",
  },
];

export const pendingApprovals = [
  {
    id: "sandrine",
    name: "Uvimana Sandrine",
    goal: "Start a business",
    steps: "2 steps",
    time: "Today",
    avatar: { label: "US", bg: "#1f6f4c", photo: "/sandrine.jpg" },
  },
  {
    id: "fabrice",
    name: "Magisha Fabrice",
    goal: "Get vocational training",
    steps: "1 step",
    time: "Today",
    avatar: { label: "MF", bg: "#3b6b52", photo: "/fablice.jpg" },
  },
  {
    id: "gloria",
    name: "Iratege Gloria",
    goal: "Find a job",
    steps: "3 steps",
    time: "Yesterday",
    avatar: { label: "IG", bg: "#15583b", photo: "/gloria.jpg" },
  },
];

export const weeklySteps = [
  { day: "Mon", value: 24 },
  { day: "Tue", value: 38 },
  { day: "Wed", value: 46 },
  { day: "Thu", value: 42 },
  { day: "Fri", value: 30 },
  { day: "Sat", value: 35 },
  { day: "Sun", value: 21 },
];

export const officerYouthList = generateCaseload();

function generateCaseload() {
  const goals = [
    "Start a business",
    "Get vocational training",
    "Find a job",
  ];
  const steps = [
    "1. Register business",
    "2. Get TIN",
    "3. Open bank account",
    "4. Apply for loan",
    "5. Build business plan",
    "1. Choose training",
    "2. Skills assessment",
    "3. Enroll in program",
    "1. CV review",
    "2. Job matching",
    "No activity yet",
    "Completed",
  ];
  const statuses = ["On track", "Needs follow-up", "Completed"];
  const firstNames = [
    "Uvimana", "Magisha", "Habelimana", "Iratege", "Niyonshaba", "Manirakiza",
    "Ufitimana", "Mukamana", "Nkurunziza", "Ingabire", "Habimana", "Uwase",
    "Mukandayisenga", "Bazimenyera", "Munyaneza", "Umutoni", "Niyigena",
    "Tuyishime", "Muhire", "Ishimwe", "Ndayisenga", "Mukeshimana", "Bizimana",
    "Niyonzima", "Uwamahoro", "Gahigi", "Ntakirutimana", "Mukamana",
    "Rukundo", "Uwimana", "Nshimiyimana", "Kamikazi", "Sibomana", "Uwimbabazi",
  ];
  const lastNames = [
    "Sandrine", "Fabrice", "Jean", "Gloria", "Divine", "Emmanuel", "Ange",
    "Josiane", "Claude", "Aline", "Patrick", "Clarisse", "Eric", "Diane",
    "Olivier", "Chantal", "Samuel", "Esther", "Dieudonne", "Pacifique",
    "Alice", "Jean Bosco", "Solange", "Fred", "Beatrice", "Innocent",
    "Laetitia", "Viateur", "Angelique", "Yves", "Sandra", "Celestin",
    "Florence", "Gilbert",
  ];
  const times = [
    "Today, 09:32", "Today, 08:15", "Yesterday, 16:45", "May 11, 14:20",
    "May 11, 11:05", "May 10, 09:10", "May 9, 08:40", "May 8, 15:30",
    "May 7, 10:12", "May 6, 13:48", "May 5, 16:02", "May 4, 09:55",
  ];
  const photoMap: Record<string, string> = {
    "Uvimana Sandrine": "/sandrine.jpg",
    "Magisha Fabrice": "/fablice.jpg",
    "Iratege Gloria": "/gloria.jpg",
  };

  const rows = [];
  let n = 0;
  for (let i = 0; i < firstNames.length; i++) {
    for (let j = 0; j < lastNames.length; j++) {
      if (rows.length >= 128) break;
      const name = `${firstNames[i]} ${lastNames[j]}`;
      const goal = goals[(i + j) % goals.length];
      const status = statuses[(i + j * 2) % statuses.length];
      const time = times[(i * 3 + j) % times.length];
      const initials = name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2);
      const colors = ["#1f6f4c", "#3b6b52", "#15583b", "#2f5f46", "#4a7c63"];
      rows.push({
        id: `youth-${++n}`,
        name,
        goal,
        currentStep: status === "Completed" ? "Completed" : steps[(i + j) % steps.length],
        lastActivity: time,
        status,
        avatar: {
          label: initials,
          bg: colors[(i + j) % colors.length],
          photo: photoMap[name],
        },
      });
    }
  }
  return rows;
}

export const youthGoals = ["All goals", "Start a business", "Get vocational training", "Find a job"];
export const youthStatuses = ["All status", "On track", "Needs follow-up", "Completed"];

export const youthDetail = {
  id: "sandrine",
  name: "Uvimana Sandrine",
  goal: "Start a business",
  location: "Gasabo District, Kimihurura Sector",
  status: "On track",
  avatar: { label: "US", bg: "#1f6f4c", photo: "/sandrine.jpg" },
  progress: { completed: 2, total: 5, percent: 40 },
  lastActivity: "Today, 09:32",
  lastActivityDetail: "Viewed step details",
  roadmap: [
    {
      number: 1,
      title: "Register your business name with RDB",
      state: "done",
      status: "Completed on May 10, 2025",
      institution: "RDB",
    },
    {
      number: 2,
      title: "Get your Tax Identification Number (TIN)",
      state: "current",
      status: "Current step",
      institution: "RRA",
    },
    {
      number: 3,
      title: "Open a business bank account",
      state: "locked",
      status: "Locked",
      institution: "Bank",
    },
    {
      number: 4,
      title: "Apply for BRD loan guarantee",
      state: "locked",
      status: "Locked",
      institution: "BRD",
    },
    {
      number: 5,
      title: "Build your business plan",
      state: "locked",
      status: "Locked",
      institution: "Training",
    },
  ],
  intakeNotes: {
    name: "Uvimana Sandrine",
    goal: "Start a business",
    skills: "Tailoring certificate, basic business knowledge",
    situation:
      "Unemployed. Wants to start a tailoring business but needs guidance on registration and funding.",
    location: "Gasabo District, Kimihurura Sector",
  },
};

export const intakeForm = {
  name: "Uvimana Sandrine",
  goal: "Start a business",
  skills: "Tailoring, basic business knowledge",
  situation:
    "Unemployed. Wants to start a tailoring business but needs guidance on registration and funding.",
  district: "Gasabo District",
  sector: "Kimihurura Sector",
};

export const goalOptions = [
  "Start a business",
  "Get vocational training",
  "Find a job",
  "Get a certification",
  "Continue education",
];

import { rwandaDistricts } from "@/data/rwanda-locations";

// Re-export all 30 districts with "District" suffix for the onboarding UI
export const districts = rwandaDistricts.map((d) => `${d.name} District`);

// Re-export sectors keyed by "District Name District" for the onboarding UI
export const sectors: Record<string, string[]> = Object.fromEntries(
  rwandaDistricts.map((d) => [
    `${d.name} District`,
    [...d.sectors].sort(),
  ]),
);

export const aiDraftSteps = [
  {
    number: 1,
    title: "Register business with RDB",
    detail: "Register as an Enterprise or Domestic Company. Registration is free and takes a few hours. Your TIN is issued automatically.",
    badge: "RDB",
  },
  {
    number: 2,
    title: "Obtain Tax Identification Number (TIN)",
    detail: "TIN is issued automatically when you register through RDB. No separate application needed for most small businesses.",
    badge: "RRA",
  },
  {
    number: 3,
    title: "Open business bank account",
    detail: "Open an account in a bank in your business name.",
    badge: "Bank",
  },
  {
    number: 4,
    title: "Apply for BRD loan guarantee",
    detail: "BRD covers up to 75% collateral for youth-owned businesses. Apply with your registration, TIN, and business plan.",
    badge: "BRD",
  },
  {
    number: 5,
    title: "Build your business plan",
    detail: "Prepare or review this plan for funding. BRD offers free business advisory services.",
    badge: "Training",
  },
];

export const officerMessages = [
  {
    id: "sandrine",
    name: "Uvimana Sandrine",
    preview: "Thank you for the guidance on the TIN step!",
    time: "09:32",
    unread: 1,
    avatar: { label: "US", bg: "#1f6f4c", photo: "/sandrine.jpg" },
  },
  {
    id: "fabrice",
    name: "Magisha Fabrice",
    preview: "Which training center do you recommend?",
    time: "08:15",
    unread: 0,
    avatar: { label: "MF", bg: "#3b6b52", photo: "/fablice.jpg" },
  },
  {
    id: "jean",
    name: "Habelimana Jean",
    preview: "I attached my loan documents for review.",
    time: "Yesterday",
    unread: 2,
    avatar: { label: "HJ", bg: "#15583b" },
  },
  {
    id: "gloria",
    name: "Iratege Gloria",
    preview: "The skills assessment went well.",
    time: "May 11",
    unread: 0,
    avatar: { label: "IG", bg: "#2f5f46", photo: "/gloria.jpg" },
  },
];
