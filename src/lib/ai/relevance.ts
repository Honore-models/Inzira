// ============================================================
// INZIRA AI - Topic Relevance Filter
// Catches off-topic questions before they reach the LLM
// ============================================================

/**
 * Keywords that indicate the question is within Inzira's scope.
 * If none of these appear in the question, it's likely off-topic.
 */
const RELEVANT_KEYWORDS = [
  // Institutions
  "rdb", "rwanda development board",
  "rra", "rwanda revenue authority", "tax",
  "brd", "development bank", "bdf", "business development fund",
  "rtb", "tvet", "vocational",
  "ministry of youth",

  // Business registration
  "register", "registration", "business", "enterprise", "company",
  "sole trader", "sole proprietor", "incorporate",

  // Tax
  "tin", "tax identification", "vat", "ebm", "billing machine",

  // Loans & financing
  "loan", "guarantee", "collateral", "financing", "fund",
  "interest", "credit", "bank account", "repayment",
  "youth fund", "single digit",

  // Training
  "training", "skills", "course", "certificate", "vocational",
  "enroll", "enrollment", "ntc", "iprc",

  // General business
  "entrepreneur", "startup", "small business", "sme",
  "business plan", "business name",

  // Rwanda context
  "rwanda", "kigali", "district", "sector",
];

/**
 * Check if a question is relevant to Inzira's verified document scope.
 * Returns true if the question likely relates to one of the allowed topics.
 */
export function isQuestionRelevant(question: string): boolean {
  const lower = question.toLowerCase().trim();

  // Very short questions (1-2 words) are ambiguous — let the LLM decide
  if (lower.split(/\s+/).length < 3) {
    return true;
  }

  // Check if any relevant keyword appears in the question
  for (const keyword of RELEVANT_KEYWORDS) {
    if (lower.includes(keyword)) {
      return true;
    }
  }

  return false;
}

/**
 * Standard off-topic response.
 */
export const OFF_TOPIC_MESSAGE =
  "I can only help with business registration, loans, training, and entrepreneurship programs in Rwanda. For other questions, please contact your youth officer.";
