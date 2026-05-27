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
        `${clause.title} ${clause.text}`.toLowerCase();

      // HIGH RISK
      if (
        RISK_PATTERNS.unlimitedLiability.test(
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
            "Unlimited liability exposure",
        };
      }

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
            "Contains employee restriction clause",
        };
      }

      // TERM DURATION
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
            `Contract term exceeds 12 months (${duration[1]} months)`,
        };
      }

      // MEDIUM RISK
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

      if (
        RISK_PATTERNS.termination.test(
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
            "Termination clause detected",
        };
      }

      // LOW RISK
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

      if (
        RISK_PATTERNS.confidentiality.test(
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
            "Standard confidentiality clause",
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