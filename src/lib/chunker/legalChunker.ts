export interface Clause {
  clauseNumber: string;
  title: string;
  text: string;
}

export const legalChunker = (
  documentText: string
): Clause[] => {
  const lines =
    documentText
      .split("\n")
      .map((line) =>
        line.trim()
      )
      .filter(Boolean);

  const clauses: Clause[] =
    [];

  let currentClause:
    | Clause
    | null = null;

  const isHeading = (
    line: string
  ) => {
    return (
      /^\d+(\.\d+)*\.\s+[A-Z]/.test(
        line
      ) ||
      /^\d+(\.\d+)*\s+[A-Z]/.test(
        line
      ) ||
      /^CLAUSE\s+\d+/i.test(
        line
      ) ||
      /^ARTICLE\s+[IVXLC]+/i.test(
        line
      ) ||
      /^[A-Z][A-Z\s]{5,}$/.test(
        line
      )
    );
  };

  for (const line of lines) {
    if (
      isHeading(
        line
      )
    ) {
      if (
        currentClause
      ) {
        clauses.push(
          currentClause
        );
      }

      const match =
        line.match(
          /^\d+(\.\d+)*/
        );

      currentClause =
        {
          clauseNumber:
            match?.[0] ??
            "UNKNOWN",

          title: line,

          text: "",
        };

      continue;
    }

    if (
      currentClause
    ) {
      currentClause.text +=
        line + " ";
    }
  }

  if (currentClause) {
    clauses.push(
      currentClause
    );
  }

  return clauses;
};