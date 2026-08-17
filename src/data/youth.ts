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
    details: {
      fullDescription:
        "The Rwanda Development Board is the national agency responsible for business registration, investment promotion, and private sector development. It is the first stop when registering your business name and getting the licenses you need to operate legally.",
      services: [
        "Business name registration",
        "Company and investment licenses",
        "Startup support and incubation",
        "Investment incentives and guidance",
      ],
      phone: "+250 788 185 400",
      email: "info@rdb.rw",
      hours: "Mon – Fri, 8:00 AM – 5:00 PM",
      address: "Kigali City Tower, Avenue du Travail, Kigali",
    },
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
    details: {
      fullDescription:
        "RTB / TVET Rwanda coordinates technical and vocational education and training across the country. It connects young people to skills programs, national certificates, and work-based learning opportunities that lead to employment.",
      services: [
        "Vocational skills training",
        "National TVET certificates",
        "Career guidance and placement",
        "Short professional courses",
      ],
      phone: "+250 788 305 100",
      email: "info@rtb.rw",
      hours: "Mon – Fri, 7:30 AM – 5:00 PM",
      address: "TVET Headquarters, Kigali",
    },
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
    details: {
      fullDescription:
        "The Business Development Fund provides loan guarantees and affordable financing to small businesses and young entrepreneurs who may not qualify for traditional bank loans. It also offers business advisory services to help you prepare strong applications.",
      services: [
        "Loan guarantees for SMEs",
        "Youth and women financing",
        "Business advisory and coaching",
        "Loan application support",
      ],
      phone: "+250 788 180 300",
      email: "info@bdf.rw",
      hours: "Mon – Fri, 8:00 AM – 5:00 PM",
      address: "KK 15 Rd, Kigali",
    },
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
    details: {
      fullDescription:
        "The Rwanda Revenue Authority is the national tax administration. It issues Tax Identification Numbers (TINs), processes tax registration, and provides guidance on tax obligations so you can comply as your business grows.",
      services: [
        "TIN registration",
        "Tax filing and compliance support",
        "Taxpayer education",
        "E-services online portal",
      ],
      phone: "+250 788 180 000",
      email: "info@rra.gov.rw",
      hours: "Mon – Fri, 7:00 AM – 6:00 PM",
      address: "RRA Headquarters, Boulevard de l'Umuganda, Kigali",
    },
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

export const conversations = [
  {
    id: "jean-claude",
    name: "Jean Claude",
    role: "Youth Officer",
    location: "Gasabo District",
    time: "10:30 AM",
    unread: 2,
    preview:
      "Hello Diane, I reviewed your progress. Great job completing the first step!",
    avatar: {
      kind: "initials",
      label: "JC",
      bg: "#1f6f4c",
      photo: "/jeanclaude.jpg",
    },
    active: true,
  },
  {
    id: "inzira-support",
    name: "Inzira Support",
    time: "Yesterday",
    preview: "Thank you for reaching out. We will get back to you soon.",
    avatar: { kind: "icon", label: "users", bg: "#e8f0eb" },
  },
  {
    id: "alice-umutoni",
    name: "Alice Umutoni",
    role: "Training Advisor",
    location: "WDA",
    time: "May 10",
    preview: "Information about the tailoring training program you asked for.",
    avatar: { kind: "initials", label: "AU", bg: "#15583b" },
  },
  {
    id: "rdb-info",
    name: "RDB Information Desk",
    time: "May 8",
    preview: "Here is the link to the business registration guide.",
    avatar: { kind: "initials", label: "RDB", bg: "#ffffff", color: "#1f6f4c" },
  },
];

export const conversationMessages = [
  {
    id: 1,
    from: "officer",
    time: "10:30 AM",
    text: "Hello Diane,\n\nI reviewed your progress. Great job completing the first step (Register your business name with RDB).\n\nYou can now move to the next step. If you have any questions, I'm here to help.\n\n— Jean Claude",
  },
  {
    id: 2,
    from: "me",
    time: "10:32 AM",
    text: "Thank you! I have a question. Do I need to pay anything when I apply for the TIN?",
  },
  {
    id: 3,
    from: "officer",
    time: "10:35 AM",
    text: "Good question! No, getting a TIN is free. I'll send you the official guide so you can see the requirements.",
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
