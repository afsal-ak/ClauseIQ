import { NextResponse } from "next/server";

import { processDocument } from "@/lib/document/processor";
import { legalChunker } from "@/lib/chunker/legalChunker";
import { compareClauses } from "@/lib/comparison/compareClauses";
import { analyzeRisk } from "@/lib/risk/riskAnalyzer";

import { saveDocument } from "@/services/document.service";
import { saveComparison } from "@/services/comparison.service";

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

    if (
      !oldFile ||
      !newFile
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Both documents are required",
        },
        {
          status: 400,
        }
      );
    }

    // Process documents
    const oldText =
      await processDocument(
        oldFile
      );

    const newText =
      await processDocument(
        newFile
      );

    // Chunk documents
    const oldClauses =
      legalChunker(
        oldText
      );

    const newClauses =
      legalChunker(
        newText
      );

    // Risk analysis
    const oldRisks =
      analyzeRisk(
        oldClauses
      );

    const newRisks =
      analyzeRisk(
        newClauses
      );

    // Save documents + chunks
    const oldDocument =
      await saveDocument(
        oldFile.name,
        oldText,
        oldClauses
      );

    const newDocument =
      await saveDocument(
        newFile.name,
        newText,
        newClauses
      );

    // Compare clauses
    const comparison =
      compareClauses(
        oldClauses,
        newClauses
      );

    // Save comparison
    await saveComparison(
      oldDocument.id,
      newDocument.id,
      comparison
    );

    return NextResponse.json(
      {
        success: true,

        oldDocumentId:
          oldDocument.id,

        newDocumentId:
          newDocument.id,

        comparison,

        oldRisks,
        newRisks,
      }
    );
  } catch (
    error
  ) {
    console.error(
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Comparison failed",
      },
      {
        status: 500,
      }
    );
  }
}
// import { NextResponse } from "next/server";

// import { processDocument } from "@/lib/document/processor";
// import { legalChunker } from "@/lib/chunker/legalChunker";
// import { compareClauses } from "@/lib/comparison/compareClauses";

// export async function POST(
//   request: Request
// ) {
//   try {
//     const formData =
//       await request.formData();

//     const oldFile =
//       formData.get(
//         "oldFile"
//       ) as File;

//     const newFile =
//       formData.get(
//         "newFile"
//       ) as File;

//     if (
//       !oldFile ||
//       !newFile
//     ) {
//       return NextResponse.json(
//         {
//           success:
//             false,
//           message:
//             "Both documents are required",
//         },
//         {
//           status: 400,
//         }
//       );
//     }

//     const oldText =
//       await processDocument(
//         oldFile
//       );

//     const newText =
//       await processDocument(
//         newFile
//       );

//     const oldClauses =
//       legalChunker(
//         oldText
//       );

//     const newClauses =
//       legalChunker(
//         newText
//       );

//     const comparison =
//       compareClauses(
//         oldClauses,
//         newClauses
//       );

//     return NextResponse.json(
//       {
//         success:
//           true,
//         comparison,
//       }
//     );
//   } catch (
//     error
//   ) {
//     console.error(
//       error
//     );

//     return NextResponse.json(
//       {
//         success:
//           false,
//         message:
//           "Comparison failed",
//       },
//       {
//         status: 500,
//       }
//     );
//   }
// }