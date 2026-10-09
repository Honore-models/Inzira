import { rwandaDistricts } from "@/data/rwanda-locations";

export const GOALS = [
  {
    value: "Start a business",
    description: "Register, fund and grow your own business",
  },
  {
    value: "Get vocational training",
    description: "Learn practical skills and get a recognised certificate",
  },
  {
    value: "Get funding for my business",
    description: "Access youth loans and loan guarantees",
  },
  {
    value: "Find a job",
    description: "Prepare for and find employment",
  },
] as const;

export const goalOptions: string[] = GOALS.map((g) => g.value);

/** "Gasabo District", … — the format stored on profiles. */
export const districts = rwandaDistricts
  .map((d) => `${d.name} District`)
  .sort();

export const sectors: Record<string, string[]> = Object.fromEntries(
  rwandaDistricts.map((d) => [`${d.name} District`, [...d.sectors].sort()]),
);

/** Sectors for a district stored either as "Gasabo" or "Gasabo District". */
export function sectorsFor(district: string): string[] {
  if (!district) return [];
  return sectors[district] || sectors[`${district} District`] || [];
}

export const INSTITUTIONS = ["RDB", "RRA", "BRD", "RTB", "Ministry of Youth", "Bank", "District office", "Other"];

export const ASK_SUGGESTIONS = [
  "How do I register my business with RDB?",
  "Do I need a TIN, and how do I get one?",
  "What is the Youth Fund and who can apply?",
  "How do I join a TVET program?",
];

export const ASK_TOPICS = [
  { label: "Business registration", question: "What are the steps to register a small business in Rwanda?" },
  { label: "Tax & TIN", question: "How does tax registration and the TIN work for a new business?" },
  { label: "Loans & guarantees", question: "How can a young entrepreneur get a BRD loan guarantee?" },
  { label: "Youth Fund", question: "What are the conditions of the Youth Fund loans?" },
  { label: "Vocational training", question: "What vocational training options does RTB offer?" },
];
