// ============================================================
// INZIRA AI - Verified Pathway/Dependency Rules
//
// These are OFFICIAL step dependencies maintained by humans.
// The LLM must NOT independently invent step ordering.
// It must use these rules when constructing roadmaps.
// ============================================================

export interface PathwayRule {
  id: string;
  name: string;
  steps: PathwayStep[];
}

export interface PathwayStep {
  order: number;
  institution: string;
  title: string;
  requiredBefore?: string[]; // IDs of steps that must come after this
  description: string;
  requiredDocuments: string[];
  notes?: string;
}

/**
 * Verified pathway rules for business registration in Rwanda.
 * These are maintained by the Inzira team and verified against
 * official RDB, RRA, BRD, and RTB documentation.
 */
export const PATHWAYS: PathwayRule[] = [
  {
    id: "business-registration",
    name: "Business Registration & Funding",
    steps: [
      {
        order: 1,
        institution: "RDB",
        title: "Register business with RDB",
        description:
          "Register your business (Enterprise or Domestic Company) with the Rwanda Development Board. Registration is free. Processing typically takes a few hours.",
        requiredDocuments: [
          "National ID or passport",
          "Three business name options (for Enterprise)",
          "Physical address",
          "Phone number or email",
          "Activity description",
        ],
        notes: "Enterprise registration is for businesses with turnover under RWF 10,000/day. Your TIN is issued automatically with your registration certificate.",
      },
      {
        order: 2,
        institution: "RRA",
        title: "Obtain Tax Identification Number (TIN)",
        requiredBefore: ["business-registration-rdb"],
        description:
          "Your TIN is issued automatically when you register through RDB — no separate application needed for most small businesses.",
        requiredDocuments: ["National ID", "Business registration certificate"],
        notes: "TIN registration is free. Only businesses with turnover over RWF 20 million/year need separate VAT registration.",
      },
      {
        order: 3,
        institution: "Bank",
        title: "Open business bank account",
        requiredBefore: ["business-registration-rra"],
        description:
          "Open a business bank account in the name of your registered business.",
        requiredDocuments: [
          "National ID",
          "Business registration certificate",
          "TIN certificate",
        ],
        notes:
          "Visit any commercial bank. Some banks offer youth-friendly accounts.",
      },
      {
        order: 4,
        institution: "BRD",
        title: "Apply for BRD loan guarantee",
        requiredBefore: ["business-registration-bank"],
        description:
          "Apply for a loan guarantee from the Development Bank of Rwanda (formerly BDF) to access affordable financing.",
        requiredDocuments: [
          "National ID",
          "Business registration certificate",
          "TIN",
          "Business plan",
          "Bank statements",
          "Quotations for equipment/supplies",
          "District endorsement letter",
        ],
        notes:
          "BRD covers up to 50% collateral for general SMEs, and up to 75% for youth and women-owned businesses. Processing takes 2-4 weeks.",
      },
      {
        order: 5,
        institution: "Various",
        title: "Build business plan",
        description:
          "Develop or refine a business plan to guide your operations and strengthen funding applications.",
        requiredDocuments: [],
        notes: "BRD and other institutions offer free business advisory services.",
      },
    ],
  },
  {
    id: "youth-funding",
    name: "Youth Fund Single-Digit Interest Loans",
    steps: [
      {
        order: 1,
        institution: "RDB",
        title: "Register business with RDB",
        description:
          "Register your business with the Rwanda Development Board. Your TIN is issued automatically.",
        requiredDocuments: ["National ID or passport"],
        notes: "Registration is free and takes a few hours.",
      },
      {
        order: 2,
        institution: "Bank",
        title: "Open business bank account",
        requiredBefore: ["youth-funding-rdb"],
        description:
          "Open a business bank account for your registered business.",
        requiredDocuments: ["National ID", "Business registration certificate", "TIN"],
      },
      {
        order: 3,
        institution: "BRD",
        title: "Apply for Youth Fund loan",
        requiredBefore: ["youth-funding-bank"],
        description:
          "Apply for the Youth Fund loan at 9% interest with 90% collateral guarantee. Loan amounts capped at RWF 10 million.",
        requiredDocuments: [
          "National ID",
          "Business registration certificate",
          "Repayment plan",
          "Evidence of working with business support institutions",
        ],
        notes:
          "You only need to provide 10% collateral. Successful repayment earns a 10% grant bonus. Repayment begins 3 months after disbursement.",
      },
    ],
  },
  {
    id: "vocational-training",
    name: "Vocational Training Enrollment",
    steps: [
      {
        order: 1,
        institution: "RTB",
        title: "Choose a TVET program",
        description:
          "Research and select a vocational training program. RTB offers TVET from level 1 to level 5 through VTCs, TSSs, and IPRCs.",
        requiredDocuments: [],
        notes: "Visit your nearest TVET center or check available programs at rtb.gov.rw.",
      },
      {
        order: 2,
        institution: "RTB",
        title: "Check eligibility and gather documents",
        description:
          "Confirm you meet the program requirements and collect all necessary documents.",
        requiredDocuments: ["National ID", "School certificate (if required)"],
      },
      {
        order: 3,
        institution: "RTB",
        title: "Enroll in the program",
        description:
          "Submit your application and complete enrollment at the chosen TVET center.",
        requiredDocuments: [
          "National ID",
          "Application form",
          "School certificate",
        ],
      },
      {
        order: 4,
        institution: "RTB",
        title: "Complete training and certification",
        description:
          "Attend classes, complete coursework, and receive your TVET certificate. 84% of graduates find jobs within 9 months.",
        requiredDocuments: [],
        notes: "Duration varies by program (3 months to 2 years). RTB also offers short 6-12 month courses for NEET youth.",
      },
    ],
  },
];

/**
 * Get a pathway by its ID.
 */
export function getPathway(pathwayId: string): PathwayRule | undefined {
  return PATHWAYS.find((p) => p.id === pathwayId);
}

/**
 * Get all available pathways.
 */
export function getAllPathways(): PathwayRule[] {
  return PATHWAYS;
}

/**
 * Match a user's goal to the most relevant pathway.
 * Returns the pathway ID or null if no match.
 */
export function matchGoalToPathway(goal: string): string | null {
  const lowerGoal = goal.toLowerCase();

  if (
    lowerGoal.includes("business") ||
    lowerGoal.includes("register") ||
    lowerGoal.includes("start") ||
    lowerGoal.includes("entrepreneur")
  ) {
    return "business-registration";
  }

  if (
    lowerGoal.includes("training") ||
    lowerGoal.includes("vocational") ||
    lowerGoal.includes("tvet") ||
    lowerGoal.includes("skills") ||
    lowerGoal.includes("learn")
  ) {
    return "vocational-training";
  }

  return null;
}
