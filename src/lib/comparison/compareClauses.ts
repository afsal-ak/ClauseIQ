import stringSimilarity from "string-similarity";
import { diffWords } from "diff";

import { Clause }
from "../chunker/legalChunker";
 

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

  similarityScore?: number;

  diff?: {
    value: string;
    added?: boolean;
    removed?: boolean;
  }[];
}

const THRESHOLD = 0.65;

export const compareClauses = (
  oldClauses: Clause[],
  newClauses: Clause[]
): ComparedClause[] => {
  const results:
    ComparedClause[] = [];

  const matchedNew =
    new Set<string>();

  for (const oldClause of oldClauses) {
    let matched:
      | Clause
      | null = null;

    let similarityScore = 1;

    // LEVEL 1:
    // Match by clause number
    matched =
      newClauses.find(
        (
          newClause
        ) =>
          newClause.clauseNumber ===
            oldClause.clauseNumber &&
          !matchedNew.has(
            newClause.clauseNumber
          )
      ) || null;

    // LEVEL 2:
    // Semantic fallback
    if (!matched) {
      let bestScore = 0;

      let bestMatch:
        | Clause
        | null =
        null;

      for (const candidate of newClauses) {
        // avoid duplicate matching
        if (
          matchedNew.has(
            candidate.clauseNumber
          )
        ) {
          continue;
        }

        const titleScore =
          stringSimilarity.compareTwoStrings(
            oldClause.title.toLowerCase(),
            candidate.title.toLowerCase()
          );

        const textScore =
          stringSimilarity.compareTwoStrings(
            oldClause.text.toLowerCase(),
            candidate.text.toLowerCase()
          );

        // weighted score
        const score =
          titleScore * 0.3 +
          textScore * 0.7;

        if (
          score >
          bestScore
        ) {
          bestScore =
            score;

          bestMatch =
            candidate;
        }
      }

      if (
        bestMatch &&
        bestScore >
          THRESHOLD
      ) {
        matched =
          bestMatch;

        similarityScore =
          bestScore;
      }
    }

    // REMOVED
    if (!matched) {
      results.push({
        clauseNumber:
          oldClause.clauseNumber,

        title:
          oldClause.title,

        status:
          "REMOVED",

        oldText:
          oldClause.text,
      });

      continue;
    }

    matchedNew.add(
      matched.clauseNumber
    );

    const isSame =
      oldClause.text
        .trim()
        .replace(
          /\s+/g,
          " "
        ) ===
      matched.text
        .trim()
        .replace(
          /\s+/g,
          " "
        );

    // WORD LEVEL DIFF
    const diff =
      diffWords(
        oldClause.text,
        matched.text
      );

    results.push({
      clauseNumber:
        matched.clauseNumber,

      title:
        matched.title,

      status:
        isSame
          ? "UNCHANGED"
          : "MODIFIED",

      oldText:
        oldClause.text,

      newText:
        matched.text,

      similarityScore,

      diff,
    });
  }

  // ADDED CLAUSES
  for (const clause of newClauses) {
    if (
      !matchedNew.has(
        clause.clauseNumber
      )
    ) {
      results.push({
        clauseNumber:
          clause.clauseNumber,

        title:
          clause.title,

        status:
          "ADDED",

        newText:
          clause.text,
      });
    }
  }

  return results;
};
// import { Clause } from "../chunker/legalChunker";

// export interface ComparedClause {
//   clauseNumber: string;
//   title: string;
//   status:
//     | "ADDED"
//     | "REMOVED"
//     | "MODIFIED"
//     | "UNCHANGED";
//   oldText?: string;
//   newText?: string;
// }

// export const compareClauses = (
//   oldClauses: Clause[],
//   newClauses: Clause[]
// ): ComparedClause[] => {
//   const comparisons: ComparedClause[] =
//     [];

//   const oldMap =
//     new Map(
//       oldClauses.map(
//         (
//           clause
//         ) => [
//           clause
//             .clauseNumber,
//           clause,
//         ]
//       )
//     );

//   const newMap =
//     new Map(
//       newClauses.map(
//         (
//           clause
//         ) => [
//           clause
//             .clauseNumber,
//           clause,
//         ]
//       )
//     );

//   // Check existing clauses
//   for (const [
//     clauseNumber,
//     oldClause,
//   ] of oldMap) {
//     const newClause =
//       newMap.get(
//         clauseNumber
//       );

//     // Removed
//     if (
//       !newClause
//     ) {
//       comparisons.push(
//         {
//           clauseNumber,
//           title:
//             oldClause.title,
//           status:
//             "REMOVED",
//           oldText:
//             oldClause.text,
//         }
//       );

//       continue;
//     }

//     // Modified
//     if (
//       oldClause.text.trim() !==
//       newClause.text.trim()
//     ) {
//       comparisons.push(
//         {
//           clauseNumber,
//           title:
//             newClause.title,
//           status:
//             "MODIFIED",
//           oldText:
//             oldClause.text,
//           newText:
//             newClause.text,
//         }
//       );
//     } else {
//       // Unchanged
//       comparisons.push(
//         {
//           clauseNumber,
//           title:
//             newClause.title,
//           status:
//             "UNCHANGED",
//           oldText:
//             oldClause.text,
//         }
//       );
//     }
//   }

//   // Added clauses
//   for (const [
//     clauseNumber,
//     newClause,
//   ] of newMap) {
//     if (
//       !oldMap.has(
//         clauseNumber
//       )
//     ) {
//       comparisons.push(
//         {
//           clauseNumber,
//           title:
//             newClause.title,
//           status:
//             "ADDED",
//           newText:
//             newClause.text,
//         }
//       );
//     }
//   }

//   return comparisons;
// };