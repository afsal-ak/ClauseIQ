import { supabase } from "@/lib/supabase/client";

interface Clause {
  clauseNumber: string;
  title: string;
  text: string;
}

export const saveDocument =
  async (
    filename: string,
    extractedText: string,
    clauses: Clause[]
  ) => {
    // Save document
    const {
      data: document,
      error:
        documentError,
    } =
      await supabase
        .from(
          "documents"
        )
        .insert({
          filename,
          content_text:
            extractedText,
        })
        .select()
        .single();

    if (
      documentError
    ) {
      throw new Error(
        documentError.message
      );
    }

    // Save chunks
    const chunks =
      clauses.map(
        (
          clause,
          index
        ) => ({
          document_id:
            document.id,

          chunk_index:
            index,

          clause_number:
            clause.clauseNumber,

          clause_title:
            clause.title,

          text:
            clause.text,
        })
      );

    const {
      error:
        chunkError,
    } =
      await supabase
        .from(
          "document_chunks"
        )
        .insert(
          chunks
        );

    if (
      chunkError
    ) {
      throw new Error(
        chunkError.message
      );
    }

    return document;
  };