import { NextResponse } from "next/server";
import { processDocument } from "@/lib/document/processor";
import { legalChunker } from "@/lib/chunker/legalChunker";


export async function POST(
  request: Request
) {
  try {
    const formData =
      await request.formData();

    const file = formData.get(
      "file"
    ) as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "No file uploaded",
        },
        { status: 400 }
      );
    }

    const extractedText =
      await processDocument(file);

    const clauses =
      legalChunker(
        extractedText
      );
      
    return NextResponse.json({
      success: true,
      filename: file.name,
      extractedText,
      clauses,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to process document",
      },
      { status: 500 }
    );
  }
}