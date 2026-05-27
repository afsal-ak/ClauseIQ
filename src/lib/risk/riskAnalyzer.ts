import { Clause }
from "../chunker/legalChunker";

import { RISK_PATTERNS }
from "./riskRules";

export interface ClauseRisk {
  clauseNumber: string;
  title: string;
  risk:
    | "LOW"
    | "MEDIUM"
    | "HIGH";
  reason: string;
}

export const analyzeRisk = (
  clauses: Clause[]
): ClauseRisk[] => {
  return clauses.map(
    (clause) => {
      const text =
        `${clause.title} ${clause.text}`
          .toLowerCase();

      // ----------------
      // HIGH RISK
      // ----------------

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
            "Unlimited liability exposure creates significant financial and legal risk.",
        };
      }

      if (
        RISK_PATTERNS.indemnity?.test(
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
            "Indemnity obligations may expose the business to substantial legal and financial liability.",
        };
      }

      if (
        RISK_PATTERNS.exclusivity?.test(
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
            "Exclusive obligations may restrict strategic flexibility and vendor choice.",
        };
      }

      if (
        RISK_PATTERNS.autoRenewal?.test(
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
            "Automatic renewal may create long-term lock-in risk if termination is missed.",
        };
      }

      // ----------------
      // DURATION RISK
      // ----------------

      const duration =
        text.match(
          /(\d+)\s*(month|months|year|years)/i
        );

      if (
        duration
      ) {
        const value =
          Number(
            duration[1]
          );

        const unit =
          duration[2]
            .toLowerCase();

        const months =
          unit.includes(
            "year"
          )
            ? value * 12
            : value;

        if (
          months >
          24
        ) {
          return {
            clauseNumber:
              clause.clauseNumber,
            title:
              clause.title,
            risk:
              "HIGH",
            reason:
              `Long-term contract commitment detected (${months} months), increasing commercial lock-in risk.`,
          };
        }

        if (
          months >
          12
        ) {
          return {
            clauseNumber:
              clause.clauseNumber,
            title:
              clause.title,
            risk:
              "MEDIUM",
            reason:
              `Contract term exceeds 12 months (${months} months), increasing operational commitment risk.`,
          };
        }
      }

      // ----------------
      // MEDIUM RISK
      // ----------------

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
            "Liability-related obligations may increase legal or financial exposure.",
        };
      }

      if (
        RISK_PATTERNS.payment?.test(
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
            "Payment obligations or penalties may affect cash flow and financial exposure.",
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
            "MEDIUM",
          reason:
            "Employee restriction clauses may affect hiring flexibility and workforce mobility.",
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
            "Termination clauses affect exit rights and contractual flexibility.",
        };
      }

      // ----------------
      // LOW RISK
      // ----------------

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
            "Contains dispute resolution process.",
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
            "Standard confidentiality obligations detected.",
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
          "No material legal risks detected.",
      };
    }
  );
};