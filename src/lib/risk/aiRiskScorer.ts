import { model } from "@/lib/gemini";

interface ClauseInput {
  clauseNumber: string;

  title: string;

  status:
    | "MODIFIED"
    | "ADDED"
    | "REMOVED";

  oldText?: string;

  newText?: string;
}

interface AIRisk {
  clauseNumber: string;

  title: string;

  score?: number;

  risk:
    | "LOW"
    | "MEDIUM"
    | "HIGH";

  reason?: string;

  triggeredConstraint?: string;

  recommendation?: string;
}

export const scoreClauseRisks =
  async (
    clauses: ClauseInput[],
    constraints: string[]
  ): Promise<
    AIRisk[]
  > => {
    if (
      !clauses.length
    ) {
      return [];
    }

    const prompt = `
You are an ELITE legal contract risk analyst for enterprise contracts.

Your job is to analyze the RISK OF CHANGES between OLD and NEW clauses.

CRITICAL:
You are NOT reviewing the whole clause.

You are ONLY evaluating:
1. What changed
2. Legal impact
3. Business impact
4. Financial exposure
5. Strategic risk
6. Compliance risk

You MUST think like an in-house legal counsel.

────────────────────
RISK EVALUATION RULES
────────────────────

LOW (1-3)
Minor wording changes.
Formatting improvements.
Clarification only.
No material legal impact.

MEDIUM (4-6)
Moderate business or legal impact.
Duration changed.
Payment terms changed.
Liability cap changed moderately.
Jurisdiction modified.
Moderate operational risk.

HIGH (7-10)
Protection weakened.
Confidentiality reduced.
Indemnity removed.
Termination rights removed.
Liability increased heavily.
Payment exposure increased materially.
Auto-renewal added.
Exclusive obligations added.
Strategic lock-in risk.
Severe compliance or legal exposure.

────────────────────
MANDATORY SCORING LOGIC
────────────────────

TERM / DURATION CHANGES:
- Increase <=25% → LOW
- Increase 26%-50% → MEDIUM
- Increase >50% → HIGH
- Long-term lock-in (>24 months) → HIGH
- Removal of termination flexibility → HIGH

PAYMENT:
- Delayed payments → MEDIUM/HIGH
- Penalties added → HIGH
- Major cost increase → HIGH

LIABILITY:
- Liability cap increased → MEDIUM/HIGH
- Unlimited liability → HIGH

CONFIDENTIALITY:
- Weakened obligations → HIGH

DISPUTES:
- Arbitration location changed → MEDIUM
- Litigation replacing arbitration → HIGH

NON-SOLICITATION:
- Restriction increase >12 months → MEDIUM
- Extreme lock periods → HIGH

INDEMNITY:
- Removal of indemnity → HIGH
- Broad indemnity exposure → HIGH

Firm Policies:
${constraints.join("\n")}

────────────────────
SCORING SCALE
────────────────────
1-3 = LOW
4-6 = MEDIUM
7-10 = HIGH

IMPORTANT RULES:
- Compare OLD vs NEW carefully
- Mention exact values changed
- Be strict on risk
- If duration doubles (12 → 24), minimum HIGH risk
- Explain WHY it matters
- Recommendation must be actionable
- Be concise but professional
- Never return empty reason
- Always return recommendation

GOOD EXAMPLE:

OLD:
12 months

NEW:
24 months

OUTPUT:
{
  "score": 8,
  "risk": "HIGH",
  "reason":
  "The agreement duration increased from 12 months to 24 months, doubling the commitment period and materially increasing long-term commercial and operational exposure. This reduces flexibility and increases lock-in risk if the counterparty underperforms or market conditions change.",
  "triggeredConstraint":
  "Long-term commitment exposure; Strategic flexibility risk.",
  "recommendation":
  "Review the business rationale for the extended term and consider adding break clauses or termination rights at 12 months to reduce long-term exposure."
}

For EACH clause return EXACT JSON:

{
  "clauseNumber": "",
  "title": "",
  "score": 1,
  "risk": "LOW",
  "reason": "",
  "triggeredConstraint": "",
  "recommendation": ""
}

Clauses:
${JSON.stringify(
  clauses,
  null,
  2
)}

IMPORTANT:
- Return ONLY JSON ARRAY
- NO markdown
- NO explanation
- NO extra text
- NO code block
`;

    try {
      const result =
        await model.generateContent(
          prompt
        );

      const response =
        await result.response.text();

      const cleaned =
        response
          .replace(
            /```json/g,
            ""
          )
          .replace(
            /```/g,
            ""
          )
          .trim();

      try {
        const parsed =
          JSON.parse(
            cleaned
          );

        const validated =
          Array.isArray(
            parsed
          )
            ? parsed.map(
                (
                  item
                ) => ({
                  clauseNumber:
                    item.clauseNumber ||
                    "",
                  title:
                    item.title ||
                    "",
                  score:
                    item.score ||
                    1,
                  risk:
                    item.risk ||
                    "LOW",
                  reason:
                    item.reason ||
                    "No material risk identified.",
                  triggeredConstraint:
                    item.triggeredConstraint ||
                    "No major policy triggered.",
                  recommendation:
                    item.recommendation ||
                    "No action required.",
                })
              )
            : [];

        return validated;
      } catch {
        console.error(
          "Gemini Parse Error:",
          cleaned
        );

        return [];
      }
    } catch (
      error
    ) {
      console.error(
        "Gemini Error:",
        error
      );

      return [];
    }
  };