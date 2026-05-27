import { Sparkles } from "lucide-react";

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

interface Props {
  risks: AIRisk[];
}

export default function AIRiskAnalysis({
  risks,
}: Props) {
  if (
    !risks.length
  ) {
    return null;
  }

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-5">
        <div>
         <div className="mb-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />

                  <h2 className="text-2xl font-bold">
                    AI Risk Analysis
                  </h2>
                </div>

                <p className="text-muted-foreground text-sm mt-1">
                  AI evaluates
                  clause impact,
                  legal risks,
                  obligations,
                  and sensitive
                  contract changes.
                </p>
              </div>

        </div>

        <div className="text-sm text-muted-foreground">
          {
            risks.length
          }{" "}
          clauses analyzed
        </div>
      </div>

      <div className="space-y-5">
        {risks.map(
          (
            risk,
            index
          ) => (
            <div
              key={index}
              className="rounded-2xl border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {
                      risk.clauseNumber
                    }
                    {" - "}
                    {
                      risk.title
                    }
                  </h3>

                  {risk.reason && (
                    <p className="text-muted-foreground mt-2 leading-7 text-sm">
                      {
                        risk.reason
                      }
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium
                    ${
                      risk.risk ===
                      "HIGH"
                        ? "bg-red-100 text-red-700"
                        : risk.risk ===
                            "MEDIUM"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                    }`}
                  >
                    {
                      risk.risk
                    }
                  </span>

                  {risk.score && (
                    <span className="text-xs text-muted-foreground">
                      Score:{" "}
                      {
                        risk.score
                      }
                      /10
                    </span>
                  )}
                </div>
              </div>

              {/* Firm policy */}
              {risk.triggeredConstraint && (
                <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4">
                  <p className="font-medium text-orange-700">
                    Triggered
                    Firm Policy
                  </p>

                  <p className="text-sm text-orange-900 mt-1 leading-6">
                    {
                      risk.triggeredConstraint
                    }
                  </p>
                </div>
              )}

              {/* Recommendation */}
              {risk.recommendation && (
                <div className="mt-4 rounded-xl bg-primary/5 border border-primary/20 p-4">
                  <p className="font-medium text-primary">
                    Recommendation
                  </p>

                  <p className="text-sm text-muted-foreground mt-1 leading-6">
                    {
                      risk.recommendation
                    }
                  </p>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </section>
  );
}