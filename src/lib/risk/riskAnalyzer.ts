import { Clause } from "../chunker/legalChunker";
import { RISK_PATTERNS } from "./riskRules";

export interface ClauseRisk {
  clauseNumber: string;
  title: string;
  risk: "LOW" | "MEDIUM" | "HIGH";
  reason: string;
}

export const analyzeRisk = (
  clauses: Clause[]
): ClauseRisk[] => {
  return clauses.map(
    (clause) => {
      const text =
        `${clause.title} ${clause.text}`;

      // HIGH RISK
      if (
        RISK_PATTERNS.nonSolicitation.test(
          text
        )
      ) {
        return {
          clauseNumber:
            clause.clauseNumber,
          title:
            clause.title,
          risk:
            "HIGH",
          reason:
            "Contains non-solicitation clause",
        };
      }

      // LIABILITY
      if (
        RISK_PATTERNS.liability.test(
          text
        )
      ) {
        return {
          clauseNumber:
            clause.clauseNumber,
          title:
            clause.title,
          risk:
            "MEDIUM",
          reason:
            "Contains liability obligations",
        };
      }

      // DURATION
      const duration =
        text.match(
          /(\d+)\s*months?/i
        );

      if (
        duration &&
        Number(
          duration[1]
        ) > 12
      ) {
        return {
          clauseNumber:
            clause.clauseNumber,
          title:
            clause.title,
          risk:
            "HIGH",
          reason:
            "Term exceeds 12 months",
        };
      }

      // ARBITRATION
      if (
        RISK_PATTERNS.arbitration.test(
          text
        )
      ) {
        return {
          clauseNumber:
            clause.clauseNumber,
          title:
            clause.title,
          risk:
            "LOW",
          reason:
            "Contains dispute resolution process",
        };
      }

      return {
        clauseNumber:
          clause.clauseNumber,
        title:
          clause.title,
        risk:
          "LOW",
        reason:
          "No major risks detected",
      };
    }
  );
};