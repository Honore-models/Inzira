export const youthCase = {
  youth: {
    name: "Diane",
    age: 23,
    district: "Musanze",
    sector: "Muhoza",
    goal: "Start and register a tailoring business",
    officer: "Jean de Dieu",
    language: "English",
  },
  progress: {
    completed: 2,
    total: 5,
    percent: 40,
    updated: "Updated today at 09:20",
  },
  nextStepId: "rdb-register",
  documents: ["National ID", "Business name choices", "Phone number", "District"],
  quickStats: [
    { label: "Roadmap status", value: "Officer approved" },
    { label: "Current institution", value: "RDB" },
    { label: "Next unlock", value: "TIN application" },
  ],
};

export const roadmapSteps = [
  {
    id: "intro",
    number: 1,
    title: "Learn about business registration",
    institution: "RDB",
    status: "Completed on 12 May 2025",
    state: "done",
    detail:
      "You reviewed why registration is needed before applying for financing or guarantees.",
  },
  {
    id: "rdb-register",
    number: 2,
    title: "Register your business name with RDB",
    institution: "RDB",
    status: "Current step",
    state: "current",
    detail: "This is the first official step to start your business.",
    location: "RDB Office – Your District",
    due: "Recommended this week",
    source: "Verified RDB business registration rules",
  },
  {
    id: "tin",
    number: 3,
    title: "Get your Tax Identification Number (TIN)",
    institution: "RRA",
    status: "Locked",
    state: "locked",
    detail: "This unlocks after your business name is registered.",
  },
  {
    id: "bank",
    number: 4,
    title: "Open a business bank account",
    institution: "Bank",
    status: "Locked",
    state: "locked",
    detail: "This unlocks after your registration and TIN are ready.",
  },
  {
    id: "bdf",
    number: 5,
    title: "Apply for a BDF loan guarantee",
    institution: "BDF",
    status: "Locked",
    state: "locked",
    detail: "This unlocks after the business bank account is open.",
  },
];

export const helpCategories = ["All", "Business", "Training", "Loans"];

export const institutions = [
  {
    id: "rdb",
    title: "RDB - Rwanda Development Board",
    description: "Business registration, licenses, and investment support",
    location: "Nyarugenge, Kigali",
    distance: "1.2 km",
    category: "Business",
    initials: "RDB",
    logoBg: "#1f6f4c",
    logo: "/RDB_logo.png",
  },
  {
    id: "rtb",
    title: "RTB / TVET Rwanda",
    description: "Vocational training programs and skills certification",
    location: "Musanze",
    distance: "2.8 km",
    category: "Training",
    initials: "RTB",
    logoBg: "#2f5f46",
    logo: "/RTB_logo.jpg",
  },
  {
    id: "bdf",
    title: "BDF - Business Development Fund",
    description: "Loan guarantees for youth and small businesses",
    location: "Musanze",
    distance: "3.5 km",
    category: "Loans",
    initials: "BDF",
    logoBg: "#15583b",
    logo: "/BDF_logo.png",
  },
  {
    id: "rra",
    title: "RRA - Rwanda Revenue Authority",
    description: "Tax office for TIN registration and compliance",
    location: "Musanze",
    distance: "4.1 km",
    category: "Business",
    initials: "RRA",
    logoBg: "#3b6b52",
    logo: "/RRA_logo.png",
  },
];

export const askSuggestions = [
  "How much does it cost to register a business?",
  "Where is the closest RDB office?",
  "What is a TIN and how do I get it?",
];

export const askSampleExchange = {
  question: "What documents do I need to register my business name?",
  answerHeader: "To register your business name with RDB, you'll need:",
  answer: [
    "National ID",
    "Business name (3 options in order of preference)",
    "Physical address",
    "Phone number or email",
    "Activity description",
  ],
  source: {
    label: "RDB - Business Name Registration Guide (2024)",
    href: "#",
  },
};

export const askCommonTopics = [
  { label: "Business registration", icon: "building" },
  { label: "Loans & guarantees", icon: "wallet" },
  { label: "Training programs", icon: "graduation" },
  { label: "Eligibility rules", icon: "clipboard" },
];

export const seededMessages = [
  {
    from: "AI companion",
    text: "For your current step, bring your National ID and prepare two possible business names.",
    source: "RDB registration checklist",
  },
  {
    from: "Youth officer Jean",
    text: "After you register, send me the confirmation number and I will review the next step.",
    source: "Officer note",
  },
];

export const intakeGoals = [
  {
    title: "Start a business",
    text: "I want to start or grow my own business",
    selected: true,
  },
  {
    title: "Get vocational training",
    text: "I want to learn skills or go to a training center",
    selected: false,
  },
  {
    title: "Find a job",
    text: "I want to find employment",
    selected: false,
  },
];
