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
 * official RDB, RRA, and BDF documentation.
 */
export const PATHWAYS: PathwayRule[] = [
  {
    id: "business-registration",
    name: "Business Registration & Funding",
    steps: [
      {
        order: 1,
        institution: "RDB",
        title: "Register business name with RDB",
        description:
          "Register your business name and obtain a registration certificate from the Rwanda Development Board.",
        requiredDocuments: [
          "National ID",
          "Three business name options",
          "Physical address",
          "Phone number or email",
          "Activity description",
        ],
        notes: "Business name registration is free of charge.",
      },
      {
        order: 2,
        institution: "RRA",
        title: "Obtain Tax Identification Number (TIN)",
        requiredBefore: ["business-registration-rdb"],
        description:
          "Apply for and obtain your TIN from the Rwanda Revenue Authority. This is required before opening a bank account.",
        requiredDocuments: ["National ID", "Business registration certificate"],
        notes: "TIN registration is free. Can be done online at rra.gov.rw.",
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
        institution: "BDF",
        title: "Apply for BDF loan guarantee",
        requiredBefore: ["business-registration-bank"],
        description:
          "Apply for a loan guarantee from the Business Development Fund to access affordable financing.",
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
          "Loan guarantees cover up to 80% of the loan. Processing takes 2-4 weeks.",
      },
      {
        order: 5,
        institution: "Various",
        title: "Build business plan",
        description:
          "Develop or refine a business plan to guide your operations and strengthen funding applications.",
        requiredDocuments: [],
        notes: "BDF and other institutions offer free business advisory services.",
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
          "Research and select a vocational training program that matches your interests and career goals.",
        requiredDocuments: [],
        notes: "Visit your nearest TVET center or check available programs.",
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
          "Attend classes, complete coursework, and receive your TVET certificate.",
        requiredDocuments: [],
        notes: "Duration varies by program (3 months to 2 years).",
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
