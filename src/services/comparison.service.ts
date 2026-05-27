  import { supabase }
from "@/lib/supabase/client";
export const compareDocuments =
  async (
    oldFile: File,
    newFile: File,
    aiMode = false
  ) => {
    const formData =
      new FormData();

    formData.append(
      "oldFile",
      oldFile
    );

    formData.append(
      "newFile",
      newFile
    );

    formData.append(
      "aiMode",
      String(aiMode)
    );

    const response =
      await fetch(
        "/api/compare",
        {
          method: "POST",
          body: formData,
        }
      );

    return response.json();
  };
// export const compareDocuments =
//   async (
//     oldFile: File,
//     newFile: File
//   ) => {
//     const formData =
//       new FormData();

//     formData.append(
//       "oldFile",
//       oldFile
//     );

//     formData.append(
//       "newFile",
//       newFile
//     );

//     const response =
//       await fetch(
//         "/api/compare",
//         {
//           method:
//             "POST",
//           body: formData,
//         }
//       );

//     return response.json();
//   };


export const
saveComparison =
async (
  oldDocId: string,
  newDocId: string,
  comparison: any[]
) => {
  const rows =
    comparison.map(
      (item) => ({
        doc_v1_id:
          oldDocId,

        doc_v2_id:
          newDocId,

        clause_number:
          item.clauseNumber,

        title:
          item.title,

        match_type:
          item.status,

        old_text:
          item.oldText ??
          null,

        new_text:
          item.newText ??
          null,

        similarity_score:
          null,

        diff_text:
          null,

        chunk_v1_id:
          null,

        chunk_v2_id:
          null,
      })
    );

  const {
    error,
    data,
  } =
    await supabase
      .from(
        "comparison_results"
      )
      .insert(rows)
      .select();

  if (error) {
    console.error(
      error
    );
    throw error;
  }

  return data;
};