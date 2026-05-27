"use client";

import { useState } from "react";
import {
  UploadCloud,
  FileText,
  Loader2,
  Scale,
  X,
} from "lucide-react";

import { compareDocuments } from "@/services/comparison.service";
import ClauseDiff from "./ClauseDiff";

export default function CompareContracts() {
  const [oldFile, setOldFile] =
    useState<File | null>(null);

  const [newFile, setNewFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [comparison, setComparison] =
    useState<any[]>([]);

  const allowedTypes = [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "old" | "new"
  ) => {
    const selectedFile =
      e.target.files?.[0];

    if (!selectedFile) return;

    if (
      !allowedTypes.includes(
        selectedFile.type
      )
    ) {
      setError(
        "Only DOCX files are allowed"
      );
      return;
    }

    setError("");

    if (type === "old") {
      setOldFile(selectedFile);
    } else {
      setNewFile(selectedFile);
    }
  };

  const handleCompare =
    async () => {
      if (
        !oldFile ||
        !newFile
      ) {
        setError(
          "Please upload both documents"
        );
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await compareDocuments(
            oldFile,
            newFile
          );

        if (
          !response.success
        ) {
          throw new Error(
            response.message
          );
        }

        setComparison(
          response.comparison ||
            []
        );
      } catch (error) {
        console.error(error);

        setError(
          "Failed to compare contracts"
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-6xl mx-auto bg-card rounded-[24px] shadow-lg border p-8">
        {/* HEADER */}
        <div className="text-center mb-10">
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5">
            <Scale className="text-primary w-10 h-10" />
          </div>

          <h1 className="text-4xl font-bold">
            ClauseIQ
          </h1>

          <p className="text-muted-foreground mt-2">
            Compare legal contracts
            and detect clause
            changes instantly
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-center mb-5">
            {error}
          </p>
        )}

        {/* FILE UPLOADS */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* ORIGINAL */}
          <div className="border rounded-[24px] p-6">
            <h2 className="font-semibold text-lg mb-5">
              Original Contract
            </h2>

            <label className="border-2 border-dashed rounded-[20px] p-10 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition">
              <UploadCloud className="w-12 h-12 text-primary mb-4" />

              <p className="font-medium">
                Upload Original
                Contract
              </p>

              <p className="text-sm text-muted-foreground">
                DOCX supported
              </p>

              <input
                type="file"
                accept=".docx"
                className="hidden"
                onChange={(e) =>
                  handleFileChange(
                    e,
                    "old"
                  )
                }
              />
            </label>

            {oldFile && (
              <div className="mt-4 border rounded-xl p-4 flex items-center justify-between">
                <div className="flex gap-3 items-center">
                  <FileText className="text-primary" />

                  <div>
                    <p className="font-medium">
                      {
                        oldFile.name
                      }
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {(
                        oldFile.size /
                        1024 /
                        1024
                      ).toFixed(
                        2
                      )}{" "}
                      MB
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setOldFile(
                      null
                    )
                  }
                >
                  <X className="text-red-500" />
                </button>
              </div>
            )}
          </div>

          {/* REVISED */}
          <div className="border rounded-[24px] p-6">
            <h2 className="font-semibold text-lg mb-5">
              Revised Contract
            </h2>

            <label className="border-2 border-dashed rounded-[20px] p-10 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition">
              <UploadCloud className="w-12 h-12 text-primary mb-4" />

              <p className="font-medium">
                Upload Revised
                Contract
              </p>

              <p className="text-sm text-muted-foreground">
                DOCX supported
              </p>

              <input
                type="file"
                accept=".docx"
                className="hidden"
                onChange={(e) =>
                  handleFileChange(
                    e,
                    "new"
                  )
                }
              />
            </label>

            {newFile && (
              <div className="mt-4 border rounded-xl p-4 flex items-center justify-between">
                <div className="flex gap-3 items-center">
                  <FileText className="text-primary" />

                  <div>
                    <p className="font-medium">
                      {
                        newFile.name
                      }
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {(
                        newFile.size /
                        1024 /
                        1024
                      ).toFixed(
                        2
                      )}{" "}
                      MB
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setNewFile(
                      null
                    )
                  }
                >
                  <X className="text-red-500" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* BUTTON */}
        <button
          onClick={
            handleCompare
          }
          disabled={
            loading ||
            !oldFile ||
            !newFile
          }
          className="w-full mt-8 bg-primary text-white py-4 rounded-[16px] font-medium flex justify-center items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-5 h-5" />
              Comparing...
            </>
          ) : (
            "Compare Contracts"
          )}
        </button>

        {/* RESULTS */}
        {comparison.length >
          0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-5">
              Comparison
              Results
            </h2>

            <div className="space-y-4">
              {comparison.map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={
                      index
                    }
                    className="border rounded-xl p-5 flex justify-between items-start"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {
                          item.clauseNumber
                        }
                        {" - "}
                        {
                          item.title
                        }
                      </h3>

                      {/* {item.oldText && (
                        <div className="mt-3">
                          <p className="font-medium text-sm">
                            Old
                            Clause
                          </p>

                          <p className="text-sm text-muted-foreground">
                            {item.oldText.slice(
                              0,
                              200
                            )}
                          </p>
                        </div>
                      )}

                      {item.newText && (
                        <div className="mt-3">
                          <p className="font-medium text-sm">
                            New
                            Clause
                          </p>

                          <p className="text-sm text-muted-foreground">
                            {item.newText.slice(
                              0,
                              200
                            )}
                          </p>
                        </div>
                      )} */}
                      <ClauseDiff
  diff={item.diff}
  oldText={
    item.oldText
  }
  newText={
    item.newText
  }
  status={
    item.status
  }
/>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium
                      ${
                        item.status ===
                        "MODIFIED"
                          ? "bg-red-100 text-red-600"
                          : item.status ===
                              "ADDED"
                            ? "bg-green-100 text-green-700"
                            : item.status ===
                                "REMOVED"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {
                        item.status
                      }
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
// "use client";

// import { useState } from "react";
// import {
//   UploadCloud,
//   FileText,
//   X,
//   Loader2,
//   Scale,
// } from "lucide-react";

// import { uploadDocument } from "@/services/upload.service";

// export default function DocumentUpload() {

//   const [file, setFile] = useState<File | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [localError, setLocalError] = useState("");
//   const [documentText, setDocumentText] = useState("");

//   const [clauses, setClauses] = useState([]);
//   const [risks, setRisks] =
//     useState<any[]>([]);

//   const handleFileChange = (
//     e: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const selectedFile =
//       e.target.files?.[0];

//     if (!selectedFile) return;

//     const allowedTypes = [
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//     ];

//     if (
//       !allowedTypes.includes(
//         selectedFile.type
//       )
//     ) {
//       setLocalError(
//         "Only DOCX files are allowed"
//       );

//       return;
//     }

//     setLocalError("");
//     setFile(selectedFile);
//   };

//   const handleDrop = (
//     e: React.DragEvent<HTMLDivElement>
//   ) => {
//     e.preventDefault();

//     const droppedFile =
//       e.dataTransfer.files?.[0];

//     if (!droppedFile) return;

//     const allowedTypes = [
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//     ];

//     if (
//       !allowedTypes.includes(
//         droppedFile.type
//       )
//     ) {
//       setLocalError(
//         "Only DOCX files are allowed"
//       );

//       return;
//     }

//     setLocalError("");
//     setFile(droppedFile);
//   };

//   const handleUpload =
//     async () => {
//       if (!file) {
//         setLocalError(
//           "Please select a document"
//         );

//         return;
//       }

//       try {
//         setLoading(true);

//         const response =
//           await uploadDocument(file);

//         if (
//           !response.success
//         ) {
//           throw new Error(
//             response.message
//           );
//         }

//         setDocumentText(
//           response.extractedText
//         );
//         setClauses(
//           response.clauses
//         );
//         setRisks(
//           response.risks || []
//         );
//       } catch (error) {
//         console.error(error);

//         setLocalError(
//           "Failed to process document"
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//   return (
//     <div className="min-h-screen bg-background px-4 py-10 flex items-center justify-center">
//       <div className="w-full max-w-5xl bg-card rounded-[24px] shadow-lg border p-8">
//         <div className="text-center mb-8">
//           <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5">
//             <Scale className="text-primary w-10 h-10" />
//           </div>

//           <h1 className="text-3xl font-bold">
//             ClauseIQ
//           </h1>

//           <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
//             Upload legal
//             agreements to
//             analyze clauses,
//             detect changes,
//             and assess risk.
//           </p>
//         </div>

//         {localError && (
//           <p className="text-sm text-red-500 text-center mb-4">
//             {localError}
//           </p>
//         )}

//         <div
//           onDragOver={(e) =>
//             e.preventDefault()
//           }
//           onDrop={
//             handleDrop
//           }
//           className="border-2 border-dashed rounded-[24px] p-14 bg-muted text-center transition hover:border-primary hover:bg-primary/5"
//         >
//           <label className="cursor-pointer flex flex-col items-center justify-center">
//             <div className="bg-primary/10 p-5 rounded-full mb-5">
//               <UploadCloud className="w-12 h-12 text-primary" />
//             </div>

//             <h2 className="text-xl font-semibold">
//               Drag & Drop
//               or Click to
//               Upload
//             </h2>

//             <p className="text-sm text-muted-foreground mt-2">
//               DOCX legal
//               contracts
//               supported
//             </p>

//             <input
//               type="file"
//               accept=".docx"
//               className="hidden"
//               onChange={
//                 handleFileChange
//               }
//             />
//           </label>
//         </div>

//         {file && (
//           <div className="mt-6 bg-muted rounded-[16px] p-4 flex items-center justify-between border">
//             <div className="flex items-center gap-4">
//               <FileText className="text-primary" />

//               <div>
//                 <p className="font-medium">
//                   {file.name}
//                 </p>

//                 <p className="text-sm text-muted-foreground">
//                   {(
//                     file.size /
//                     1024 /
//                     1024
//                   ).toFixed(
//                     2
//                   )}{" "}
//                   MB
//                 </p>
//               </div>
//             </div>

//             <button
//               onClick={() =>
//                 setFile(
//                   null
//                 )
//               }
//               className="text-red-500 hover:opacity-80"
//             >
//               <X
//                 size={18}
//               />
//             </button>
//           </div>
//         )}

//         <button
//           onClick={
//             handleUpload
//           }
//           disabled={
//             !file ||
//             loading
//           }
//           className="w-full mt-6 bg-primary text-white py-4 rounded-[16px] font-medium hover:opacity-90 transition disabled:opacity-50 flex justify-center items-center gap-2"
//         >
//           {loading ? (
//             <>
//               <Loader2 className="animate-spin w-5 h-5" />
//               Processing
//               Document...
//             </>
//           ) : (
//             "Analyze Document"
//           )}
//         </button>

//         {documentText && (
//           <div className="mt-8 border rounded-[20px] p-6 bg-background">
//             <h3 className="font-semibold mb-4 text-lg">
//               Extracted
//               Text Preview
//             </h3>

//             <pre className="whitespace-pre-wrap text-sm max-h-[400px] overflow-y-auto">
//               {documentText.slice(
//                 0,
//                 5000
//               )}
//             </pre>
//           </div>
//         )}
//         {clauses.length > 0 && (
//           <div className="mt-8 space-y-4">
//             <h2 className="text-xl font-semibold">
//               Extracted Clauses
//             </h2>

//             {clauses.map(
//               (
//                 clause: any,
//                 index
//               ) => (
//                 <div
//                   key={index}
//                   className="border rounded-xl p-4"
//                 >
//                   <h3 className="font-semibold">
//                     {
//                       clause.title
//                     }
//                   </h3>

//                   <p className="text-sm text-muted-foreground mt-2">
//                     {clause.text.slice(
//                       0,
//                       200
//                     )}
//                   </p>
//                 </div>
//               )
//             )}
//           </div>
//         )}

//         {risks.length > 0 && (
//           <div className="mt-8">
//             <h2 className="text-xl font-semibold mb-4">
//               Risk Analysis
//             </h2>

//             <div className="space-y-4">
//               {risks.map(
//                 (
//                   risk,
//                   index
//                 ) => (
//                   <div
//                     key={index}
//                     className="border rounded-xl p-4 flex justify-between items-start"
//                   >
//                     <div>
//                       <h3 className="font-semibold">
//                         {
//                           risk.title
//                         }
//                       </h3>

//                       <p className="text-sm text-muted-foreground mt-1">
//                         {
//                           risk.reason
//                         }
//                       </p>
//                     </div>

//                     <span
//                       className={`px-3 py-1 rounded-full text-sm font-medium
//               ${risk.risk ===
//                           "HIGH"
//                           ? "bg-red-100 text-red-600"
//                           : risk.risk ===
//                             "MEDIUM"
//                             ? "bg-yellow-100 text-yellow-700"
//                             : "bg-green-100 text-green-700"
//                         }`}
//                     >
//                       {
//                         risk.risk
//                       }
//                     </span>
//                   </div>
//                 )
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }