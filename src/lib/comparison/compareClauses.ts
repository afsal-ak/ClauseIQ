import { Clause } from "../chunker/legalChunker";

export interface ComparedClause {
  clauseNumber: string;
  title: string;
  status:
    | "ADDED"
    | "REMOVED"
    | "MODIFIED"
    | "UNCHANGED";
  oldText?: string;
  newText?: string;
}

export const compareClauses = (
  oldClauses: Clause[],
  newClauses: Clause[]
): ComparedClause[] => {
  const comparisons: ComparedClause[] =
    [];

  const oldMap =
    new Map(
      oldClauses.map(
        (
          clause
        ) => [
          clause
            .clauseNumber,
          clause,
        ]
      )
    );

  const newMap =
    new Map(
      newClauses.map(
        (
          clause
        ) => [
          clause
            .clauseNumber,
          clause,
        ]
      )
    );

  // Check existing clauses
  for (const [
    clauseNumber,
    oldClause,
  ] of oldMap) {
    const newClause =
      newMap.get(
        clauseNumber
      );

    // Removed
    if (
      !newClause
    ) {
      comparisons.push(
        {
          clauseNumber,
          title:
            oldClause.title,
          status:
            "REMOVED",
          oldText:
            oldClause.text,
        }
      );

      continue;
    }

    // Modified
    if (
      oldClause.text.trim() !==
      newClause.text.trim()
    ) {
      comparisons.push(
        {
          clauseNumber,
          title:
            newClause.title,
          status:
            "MODIFIED",
          oldText:
            oldClause.text,
          newText:
            newClause.text,
        }
      );
    } else {
      // Unchanged
      comparisons.push(
        {
          clauseNumber,
          title:
            newClause.title,
          status:
            "UNCHANGED",
          oldText:
            oldClause.text,
        }
      );
    }
  }

  // Added clauses
  for (const [
    clauseNumber,
    newClause,
  ] of newMap) {
    if (
      !oldMap.has(
        clauseNumber
      )
    ) {
      comparisons.push(
        {
          clauseNumber,
          title:
            newClause.title,
          status:
            "ADDED",
          newText:
            newClause.text,
        }
      );
    }
  }

  return comparisons;
};