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
    detail: "Visit RDB or Irembo support and register your tailoring business name.",
    location: "RDB Office - Musanze District",
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

export const institutions = [
  {
    title: "RDB Office - Musanze District",
    meta: "Business registration and company name support",
    distance: "2.4 km away",
    hours: "Open today, 08:00-17:00",
    contact: "+250 788 000 120",
    tag: "Current step",
  },
  {
    title: "WDA / TVET Support Desk",
    meta: "Training options and certification guidance",
    distance: "8.1 km away",
    hours: "Open today, 08:30-16:30",
    contact: "+250 788 000 240",
    tag: "Training",
  },
  {
    title: "BDF Branch Office",
    meta: "Loan guarantee eligibility and application preparation",
    distance: "11.6 km away",
    hours: "Open tomorrow, 08:00-17:00",
    contact: "+250 788 000 360",
    tag: "Financing",
  },
];

export const askSuggestions = [
  "What documents do I need for RDB registration?",
  "Why do I need business registration before BDF?",
  "Can I get tailoring training while I register?",
  "When should I message my youth officer?",
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
