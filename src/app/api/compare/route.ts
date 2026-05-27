import { NextResponse } from "next/server";

import { processDocument }
  from "@/lib/document/processor";

import { legalChunker }
  from "@/lib/chunker/legalChunker";

import { compareClauses }
  from "@/lib/comparison/compareClauses";

import { analyzeRisk }
  from "@/lib/risk/riskAnalyzer";

import { scoreClauseRisks }
  from "@/lib/risk/aiRiskScorer";

import { saveDocument }
  from "@/services/document.service";

import { saveComparison }
  from "@/services/comparison.service";

import { getKnowledgeNodes }
  from "@/services/knowledge.service";

export async function POST(
  request: Request
) {
  try {
    const formData =
      await request.formData();

    const oldFile =
      formData.get(
        "oldFile"
      ) as File;

    const newFile =
      formData.get(
        "newFile"
      ) as File;

    const aiMode =
      formData.get(
        "aiMode"
      ) === "true";

    console.log(
      "AI MODE:",
      aiMode
    );

    if (
      !oldFile ||
      !newFile
    ) {
      return NextResponse.json(
        {
          success:
            false,
          message:
            "Both documents are required",
        },
        {
          status:
            400,
        }
      );
    }

    /**
     * PROCESS DOCUMENTS
     */
    const oldText =
      await processDocument(
        oldFile
      );

    const newText =
      await processDocument(
        newFile
      );

    /**
     * CHUNK DOCUMENTS
     */
    const oldClauses =
      legalChunker(
        oldText
      );

    const newClauses =
      legalChunker(
        newText
      );

    /**
     * REGEX RISK ANALYSIS
     */
    const oldRisks =
      analyzeRisk(
        oldClauses
      );

    const newRisks =
      analyzeRisk(
        newClauses
      );

    /**
     * COMPARE CLAUSES
     */
    const comparison =
      compareClauses(
        oldClauses,
        newClauses
      );

    /**
     * SAVE ONLY ON FIRST REQUEST
     * Prevent duplicate DB inserts
     * because frontend calls API twice:
     * 1. normal compare
     * 2. AI analysis
     */
    let oldDocument:
      | any
      | null =
      null;

    let newDocument:
      | any
      | null =
      null;

    if (
      !aiMode
    ) {
      console.log(
        "Saving documents..."
      );

      /**
       * SAVE DOCUMENTS
       */
      oldDocument =
        await saveDocument(
          oldFile.name,
          oldText,
          oldClauses
        );

      newDocument =
        await saveDocument(
          newFile.name,
          newText,
          newClauses
        );

      /**
       * SAVE COMPARISON
       */
      await saveComparison(
        oldDocument.id,
        newDocument.id,
        comparison
      );

      console.log(
        "Documents saved"
      );
    }

    /**
     * FAST RESPONSE
     */
    if (
      !aiMode
    ) {
      console.log(
        "Returning normal comparison"
      );

      return NextResponse.json(
        {
          success:
            true,

          oldDocumentId:
            oldDocument?.id ??
            null,

          newDocumentId:
            newDocument?.id ??
            null,

          comparison,

          oldRisks,

          newRisks,
        }
      );
    }

    /**
     * AI MODE
     */
    console.log(
      "Starting AI analysis..."
    );

    let aiRisks: Awaited<
      ReturnType<
        typeof scoreClauseRisks
      >
    > = [];

    try {
      /**
       * LOAD KNOWLEDGE
       */
      const knowledgeNodes =
        await getKnowledgeNodes();

      console.log(
        "Knowledge nodes:",
        knowledgeNodes.length
      );

      const constraints =
        knowledgeNodes.map(
          (
            node
          ) =>
            `${node.title}: ${node.content}`
        );

      /**
       * ONLY CHANGED CLAUSES
       */
      const changedClauses =
        comparison.filter(
          (
            clause
          ): clause is
            typeof clause & {
              status:
                | "MODIFIED"
                | "ADDED"
                | "REMOVED";
            } =>
            clause.status !==
            "UNCHANGED"
        );

      console.log(
        "Changed clauses:",
        changedClauses.length
      );

      /**
       * AI RISK ANALYSIS
       */
      aiRisks =
        await scoreClauseRisks(
          changedClauses.map(
            (
              clause
            ) => ({
              clauseNumber:
                clause.clauseNumber,

              title:
                clause.title,

              status:
                clause.status,

              oldText:
                clause.oldText ||
                "",

              newText:
                clause.newText ||
                "",
            })
          ),

          constraints
        );

      console.log(
        "AI RISKS:",
        aiRisks
      );
    } catch (
      error
    ) {
      console.error(
        "AI FAILED:",
        error
      );
    }

    return NextResponse.json(
      {
        success:
          true,
        aiRisks,
      }
    );
  } catch (
    error
  ) {
    console.error(
      "ROUTE FAILED:",
      error
    );

    return NextResponse.json(
      {
        success:
          false,
        message:
          "Comparison failed",
      },
      {
        status:
          500,
      }
    );
  }
}