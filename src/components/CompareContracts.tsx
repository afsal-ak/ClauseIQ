"use client";

import {
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";

import {
  UploadCloud,
  Loader2,
  Scale,
  X,
  Sparkles,
  FileText,
  GitCompareArrows,
} from "lucide-react";

import { compareDocuments } from "@/services/comparison.service";

import ClauseDiff from "./ClauseDiff";

import AIRiskAnalysis from "@/components/AIRiskAnalysis";

import { toast } from "sonner";

const STORAGE_KEY =
  "clauseiq_compare_result";

export default function CompareContracts() {
  const aiSectionRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const [oldFile, setOldFile] =
    useState<File | null>(
      null
    );

  const [newFile, setNewFile] =
    useState<File | null>(
      null
    );

  const [oldFileName,
    setOldFileName] =
    useState("");

  const [newFileName,
    setNewFileName] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  const [aiLoading,
    setAiLoading] =
    useState(false);

  const [error,
    setError] =
    useState("");

  const [aiError,
    setAiError] =
    useState("");

  const [comparison,
    setComparison] =
    useState<any[]>([]);

  const [aiRisks,
    setAiRisks] =
    useState<any[]>([]);

  const [sortBy,
    setSortBy] =
    useState("MODIFIED");

  const allowedTypes = [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  useEffect(() => {
    const saved =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!saved) return;

    try {
      const parsed =
        JSON.parse(saved);

      setComparison(
        parsed.comparison || []
      );

      setAiRisks(
        parsed.aiRisks || []
      );

      setOldFileName(
        parsed.oldFileName || ""
      );

      setNewFileName(
        parsed.newFileName || ""
      );
    } catch {
      localStorage.removeItem(
        STORAGE_KEY
      );
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        comparison,
        aiRisks,
        oldFileName,
        newFileName,
      })
    );
  }, [
    comparison,
    aiRisks,
    oldFileName,
    newFileName,
  ]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "old" | "new"
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setError(
        "Only DOCX files are supported"
      );

      toast.error(
        "Only DOCX files supported"
      );

      return;
    }

    setError("");

    if (
      type === "old"
    ) {
      setOldFile(file);
      setOldFileName(
        file.name
      );
    } else {
      setNewFile(file);
      setNewFileName(
        file.name
      );
    }
  };

  const removeFile = (
    type: "old" | "new"
  ) => {
    if (
      type === "old"
    ) {
      setOldFile(null);
      setOldFileName("");
    } else {
      setNewFile(null);
      setNewFileName("");
    }
  };

  const scrollToAI =
    () => {
      setTimeout(() => {
        aiSectionRef.current?.scrollIntoView(
          {
            behavior:
              "smooth",
            block:
              "start",
          }
        );
      }, 300);
    };

  const handleCompare =
    async () => {
      if (
        !oldFile ||
        !newFile
      ) {
        setError(
          "Upload both files"
        );

        toast.error(
          "Please upload both contracts"
        );

        return;
      }

      try {
        setLoading(true);
        setError("");
        setAiError("");

        setComparison([]);
        setAiRisks([]);

        toast.loading(
          "Comparing documents...",
          {
            id:
              "compare",
          }
        );

        const compareRes =
          await compareDocuments(
            oldFile,
            newFile,
            false
          );

        setComparison(
          compareRes.comparison ||
            []
        );

        toast.success(
          "Comparison completed",
          {
            id:
              "compare",
          }
        );

        setLoading(
          false
        );

        setAiLoading(
          true
        );

        toast.loading(
          "AI analyzing contract...",
          {
            id:
              "ai",
          }
        );

        compareDocuments(
          oldFile,
          newFile,
          true
        )
          .then(
            (
              res
            ) => {
              if (
                !res.success
              ) {
                throw new Error(
                  res.message
                );
              }

              setAiRisks(
                res.aiRisks ||
                  []
              );

              toast.success(
                "AI analysis completed",
                {
                  id:
                    "ai",
                }
              );

              scrollToAI();
            }
          )
          .catch(
            (
              err
            ) => {
              console.error(
                err
              );

              setAiError(
                "Failed to analyze risks"
              );

              toast.error(
                "AI analysis failed",
                {
                  id:
                    "ai",
                }
              );
            }
          )
          .finally(
            () =>
              setAiLoading(
                false
              )
          );
      } catch {
        setLoading(
          false
        );

        toast.error(
          "Comparison failed",
          {
            id:
              "compare",
          }
        );
      }
    };

  const [showAllClauses,
  setShowAllClauses] =
  useState(false);

const sortedComparison =
  useMemo(() => {
    const riskMap =
      aiRisks.reduce(
        (
          acc,
          risk
        ) => {
          acc[
            risk.clauseNumber
          ] =
            risk.risk;

          return acc;
        },
        {} as Record<
          string,
          "HIGH" |
          "MEDIUM" |
          "LOW"
        >
      );

    const priority = {
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    } as const;

    const sorted = [
      ...comparison,
    ].sort(
      (a, b) => {
        // changed first
        const changedA =
          a.status !==
          "UNCHANGED"
            ? 1
            : 0;

        const changedB =
          b.status !==
          "UNCHANGED"
            ? 1
            : 0;

        if (
          changedA !==
          changedB
        ) {
          return (
            changedB -
            changedA
          );
        }

        const riskA =
          (riskMap[
            a.clauseNumber
          ] ||
            "LOW") as keyof typeof priority;

        const riskB =
          (riskMap[
            b.clauseNumber
          ] ||
            "LOW") as keyof typeof priority;

        return (
          priority[
            riskB
          ] -
          priority[
            riskA
          ]
        );
      }
    );

    // only changed clauses initially
    return showAllClauses
      ? sorted
      : sorted.filter(
          (
            clause
          ) =>
            clause.status !==
            "UNCHANGED"
        );
  }, [
    comparison,
    aiRisks,
    showAllClauses,
  ]);

  return (
    <main className="min-h-screen bg-muted/20 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-[32px] border bg-card p-10 shadow-sm mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 rounded-3xl p-5">
              <Scale className="w-10 h-10 text-primary" />
            </div>

            <div>
              <h1 className="text-4xl font-bold">
                ClauseIQ
              </h1>

              <p className="text-muted-foreground mt-2 max-w-2xl">
                AI-powered
                legal clause
                comparison platform
                that detects
                contract changes,
                legal risks,
                missing clauses,
                and modification
                impact instantly.
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              title:
                "Original Contract",
              type: "old",
              fileName:
                oldFileName,
            },
            {
              title:
                "Revised Contract",
              type: "new",
              fileName:
                newFileName,
            },
          ].map(
            (item) => (
              <div
                key={
                  item.title
                }
                className="rounded-3xl border bg-card p-8"
              >
                <h2 className="font-semibold text-lg mb-5">
                  {
                    item.title
                  }
                </h2>

                <label className="border-2 border-dashed rounded-3xl p-12 flex flex-col items-center cursor-pointer hover:border-primary transition">
                  <UploadCloud className="w-12 h-12 mb-3 text-primary" />

                  <p className="font-medium">
                    Upload DOCX
                  </p>

                  <p className="text-xs text-muted-foreground mt-1">
                    Drag or
                    click to
                    upload
                  </p>

                  <input
                    hidden
                    type="file"
                    accept=".docx"
                    onChange={(
                      e
                    ) =>
                      handleFileChange(
                        e,
                        item.type as
                          any
                      )
                    }
                  />
                </label>

                {!!item.fileName && (
                  <div className="mt-4 rounded-2xl border bg-muted/40 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText className="w-5 h-5 text-primary shrink-0" />

                      <p className="truncate text-sm font-medium">
                        {
                          item.fileName
                        }
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        removeFile(
                          item.type as
                            any
                        )
                      }
                    >
                      <X className="w-4 h-4 text-muted-foreground hover:text-red-500" />
                    </button>
                  </div>
                )}
              </div>
            )
          )}
        </div>

        <button
          onClick={
            handleCompare
          }
          disabled={
            loading ||
            aiLoading
          }
          className="w-full mt-8 h-14 rounded-2xl bg-primary text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ||
          aiLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin w-5 h-5" />
              {loading
                ? "Comparing Contracts..."
                : "AI Analyzing..."}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <GitCompareArrows className="w-5 h-5" />
              Compare Contracts
            </div>
          )}
        </button>

        {!!comparison.length && (
          <div className="mt-10">
            <div>
              <div className="flex justify-between mb-5">
                <h2 className="text-2xl font-bold">
                  Comparison
                </h2>

                <select
                  className="border rounded-xl px-4"
                  value={
                    sortBy
                  }
                  onChange={(
                    e
                  ) =>
                    setSortBy(
                      e.target
                        .value
                    )
                  }
                >
                  <option value="MODIFIED">
                    Modified First
                  </option>
                </select>
              </div>
{comparison.some(
  (
    item
  ) =>
    item.status ===
    "UNCHANGED"
) && (
  <div className="mb-5 flex justify-center">
    <button
      onClick={() =>
        setShowAllClauses(
          !showAllClauses
        )
      }
      className="rounded-2xl border px-5 py-3 text-sm font-medium hover:bg-muted transition"
    >
      {showAllClauses
        ? "Hide unchanged clauses"
        : `Read more • Show ${
            comparison.filter(
              (
                item
              ) =>
                item.status ===
                "UNCHANGED"
            ).length
          } unchanged clauses`}
    </button>
  </div>
)}
              <div className="space-y-5">
                {sortedComparison.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={
                        index
                      }
                      className="rounded-3xl border bg-card p-6"
                    >
                      <div className="flex justify-between">
                        <h3 className="font-semibold text-lg">
                          {
                            item.clauseNumber
                          }{" "}
                          -{" "}
                          {
                            item.title
                          }
                        </h3>

                        <span className="rounded-full bg-primary/10 text-primary px-4 py-2 text-sm">
                          {
                            item.status
                          }
                        </span>
                      </div>

                      <ClauseDiff
                        diff={
                          item.diff
                        }
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
                  )
                )}
              </div>
            </div>

            <div
              ref={
                aiSectionRef
              }
              className="mt-12"
            >
              
              {aiLoading ? (
                <div className="rounded-3xl border bg-card p-8">
                  <div className="flex items-center gap-3">
                    <Loader2 className="animate-spin text-primary" />

                    <div>
                      <p className="font-medium">
                        AI analyzing contract
                      </p>

                      <p className="text-sm text-muted-foreground">
                        Detecting legal
                        risks &
                        clause impact...
                      </p>
                    </div>
                  </div>
                </div>
              ) : aiError ? (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
                  <p className="font-semibold text-red-700">
                    AI analysis failed
                  </p>

                  <p className="text-sm text-red-600 mt-2">
                    {
                      aiError
                    }
                  </p>
                </div>
              ) : (
                <AIRiskAnalysis
                  risks={
                    aiRisks
                  }
                />
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
// "use client";

// import { useMemo, useState } from "react";

// import {
//   UploadCloud,
//   FileText,
//   Loader2,
//   Scale,
//   X,
//   Sparkles,
// } from "lucide-react";

// import { compareDocuments }
//   from "@/services/comparison.service";

// import ClauseDiff
//   from "./ClauseDiff";

// import AIRiskAnalysis
//   from "@/components/AIRiskAnalysis";
// import { toast }
//   from "sonner";
// export default function CompareContracts() {
//   const [oldFile, setOldFile] =
//     useState<File | null>(
//       null
//     );

//   const [newFile, setNewFile] =
//     useState<File | null>(
//       null
//     );

//   const [loading, setLoading] =
//     useState(false);

//   const [aiLoading, setAiLoading] =
//     useState(false);

//   const [error, setError] =
//     useState("");
//   const [aiError, setAiError] =
//     useState("");
//   const [comparison, setComparison] =
//     useState<any[]>([]);

//   const [aiRisks, setAiRisks] =
//     useState<any[]>(([]));

//   const [sortBy, setSortBy] =
//     useState(
//       "MODIFIED"
//     );

//   const allowedTypes = [
//     "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//   ];

//   const handleFileChange = (
//     e: React.ChangeEvent<HTMLInputElement>,
//     type: "old" | "new"
//   ) => {
//     const file =
//       e.target.files?.[0];

//     if (!file) return;

//     if (
//       !allowedTypes.includes(
//         file.type
//       )
//     ) {
//       setError(
//         "Only DOCX files are supported"
//       );
//       return;
//     }

//     setError("");

//     if (
//       type === "old"
//     ) {
//       setOldFile(
//         file
//       );
//     } else {
//       setNewFile(
//         file
//       );
//     }
//   };
//   const handleCompare =
//     async () => {
//       if (
//         !oldFile ||
//         !newFile
//       ) {
//         setError(
//           "Upload both files"
//         );

//         toast.error(
//           "Please upload both contracts"
//         );

//         return;
//       }

//       try {
//         setLoading(true);
//         setError("");
//         setAiError("");
//         setComparison(
//           []
//         );
//         setAiRisks(
//           []
//         );

//         toast.loading(
//           "Comparing documents...",
//           {
//             id: "compare",
//           }
//         );

//         // FAST RESPONSE
//         const compareRes =
//           await compareDocuments(
//             oldFile,
//             newFile,
//             false
//           );

//         setComparison(
//           compareRes.comparison ||
//           []
//         );

//         setLoading(
//           false
//         );

//         toast.success(
//           "Document comparison completed",
//           {
//             id: "compare",
//           }
//         );

//         // AI START
//         setAiLoading(
//           true
//         );

//         toast.loading(
//           "AI analysis started...",
//           {
//             id: "ai",
//           }
//         );

//         compareDocuments(
//           oldFile,
//           newFile,
//           true
//         )
//           .then(
//             (
//               res
//             ) => {
//               if (
//                 !res.success
//               ) {
//                 throw new Error(
//                   res.message
//                 );
//               }

//               setAiRisks(
//                 res.aiRisks ||
//                 []
//               );

//               toast.success(
//                 "AI analysis completed",
//                 {
//                   id: "ai",
//                 }
//               );
//             }
//           )
//           .catch(
//             (
//               err
//             ) => {
//               console.error(
//                 err
//               );

//               setAiError(
//                 "Failed to analyze risks"
//               );

//               toast.error(
//                 "AI analysis failed",
//                 {
//                   id: "ai",
//                 }
//               );
//             }
//           )
//           .finally(
//             () =>
//               setAiLoading(
//                 false
//               )
//           );
//       } catch {
//         setLoading(
//           false
//         );

//         toast.error(
//           "Comparison failed",
//           {
//             id: "compare",
//           }
//         );
//       }
//     };
//   const sortedComparison =
//     useMemo(() => {
//       const riskMap =
//         aiRisks.reduce(
//           (
//             acc,
//             risk
//           ) => {
//             acc[
//               risk.clauseNumber
//             ] =
//               risk.risk;

//             return acc;
//           },
//           {} as Record<
//             string,
//             "HIGH" |
//             "MEDIUM" |
//             "LOW"
//           >
//         );

//       const priority = {
//         HIGH: 3,
//         MEDIUM: 2,
//         LOW: 1,
//       } as const;

//       return [
//         ...comparison,
//       ].sort(
//         (a, b) => {
//           // changed first
//           const changedA =
//             a.status !==
//               "UNCHANGED"
//               ? 1
//               : 0;

//           const changedB =
//             b.status !==
//               "UNCHANGED"
//               ? 1
//               : 0;

//           if (
//             changedA !==
//             changedB
//           ) {
//             return (
//               changedB -
//               changedA
//             );
//           }

//           const riskA =
//             (riskMap[
//               a.clauseNumber
//             ] ||
//               "LOW") as keyof typeof priority;

//           const riskB =
//             (riskMap[
//               b.clauseNumber
//             ] ||
//               "LOW") as keyof typeof priority;

//           return (
//             priority[
//             riskB
//             ] -
//             priority[
//             riskA
//             ]
//           );
//         }
//       );
//     }, [
//       comparison,
//       aiRisks,
//     ]);

//   return (
//     <main className="min-h-screen bg-muted/20 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* HEADER */}
//         <div className="rounded-[32px] border bg-card p-10 shadow-sm mb-8">
//           <div className="flex items-center gap-4">
//             <div className="bg-primary/10 rounded-3xl p-5">
//               <Scale className="w-10 h-10 text-primary" />
//             </div>

//             <div>
//               <h1 className="text-4xl font-bold">
//                 ClauseIQ
//               </h1>

//               <p className="text-muted-foreground mt-1">
//                 AI-powered
//                 contract
//                 comparison
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* UPLOAD */}
//         <div className="grid md:grid-cols-2 gap-6">
//           {[{
//             title:
//               "Original Contract",
//             type: "old",
//             file: oldFile,
//           },
//           {
//             title:
//               "Revised Contract",
//             type: "new",
//             file: newFile,
//           }].map(
//             (
//               item
//             ) => (
//               <div
//                 key={
//                   item.title
//                 }
//                 className="rounded-3xl border bg-card p-8"
//               >
//                 <h2 className="font-semibold text-lg mb-5">
//                   {
//                     item.title
//                   }
//                 </h2>

//                 <label className="border-2 border-dashed rounded-3xl p-12 flex flex-col items-center cursor-pointer hover:border-primary transition">
//                   <UploadCloud className="w-12 h-12 mb-3 text-primary" />

//                   <p className="font-medium">
//                     Upload DOCX
//                   </p>

//                   <input
//                     hidden
//                     type="file"
//                     accept=".docx"
//                     onChange={(
//                       e
//                     ) =>
//                       handleFileChange(
//                         e,
//                         item.type as any
//                       )
//                     }
//                   />
//                 </label>
//               </div>
//             )
//           )}
//         </div>

//         <button
//           onClick={
//             handleCompare
//           }
//           disabled={
//             loading
//           }
//           className="w-full mt-8 h-14 rounded-2xl bg-primary text-white font-semibold"
//         >
//           {loading ? (
//             <div className="flex items-center justify-center gap-2">
//               <Loader2 className="animate-spin w-5 h-5" />
//               Comparing...
//             </div>
//           ) : (
//             "Compare Contracts"
//           )}
//         </button>

//         {!!comparison.length && (
//           <div className="mt-10">
//             {/* LEFT */}
//             <div>
//               <div className="flex justify-between mb-5">
//                 <h2 className="text-2xl font-bold">
//                   Comparison
//                 </h2>

//                 <select
//                   className="border rounded-xl px-4"
//                   value={
//                     sortBy
//                   }
//                   onChange={(
//                     e
//                   ) =>
//                     setSortBy(
//                       e.target
//                         .value
//                     )
//                   }
//                 >
//                   <option value="MODIFIED">
//                     Modified
//                     First
//                   </option>
//                 </select>
//               </div>

//               <div className="space-y-5">
//                 {sortedComparison.map(
//                   (
//                     item,
//                     index
//                   ) => (
//                     <div
//                       key={
//                         index
//                       }
//                       className="rounded-3xl border bg-card p-6"
//                     >
//                       <div className="flex justify-between">
//                         <h3 className="font-semibold text-lg">
//                           {
//                             item.clauseNumber
//                           }{" "}
//                           -{" "}
//                           {
//                             item.title
//                           }
//                         </h3>

//                         <span className="rounded-full bg-primary/10 text-primary px-4 py-2 text-sm">
//                           {
//                             item.status
//                           }
//                         </span>
//                       </div>

//                       <ClauseDiff
//                         diff={
//                           item.diff
//                         }
//                         oldText={
//                           item.oldText
//                         }
//                         newText={
//                           item.newText
//                         }
//                         status={
//                           item.status
//                         }
//                       />
//                     </div>
//                   )
//                 )}
//               </div>
//             </div>

//             {/* AI RESULT */}
//             <div className="mt-12">
//               <div className="mb-5">
//                 <h2 className="text-2xl font-bold">
//                   AI Risk Analysis
//                 </h2>

//                 <p className="text-muted-foreground text-sm mt-1">
//                   Change impact &
//                   legal risk analysis
//                 </p>
//               </div>

//               {aiLoading ? (
//                 <div className="rounded-3xl border bg-card p-8">
//                   <div className="flex items-center gap-3">
//                     <Loader2 className="animate-spin text-primary" />

//                     <div>
//                       <p className="font-medium">
//                         AI analyzing
//                         contract changes
//                       </p>

//                       <p className="text-sm text-muted-foreground">
//                         Detecting legal
//                         risks...
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               ) : aiError ? (
//                 <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
//                   <p className="font-semibold text-red-700">
//                     AI analysis failed
//                   </p>

//                   <p className="text-sm text-red-600 mt-2">
//                     {aiError}
//                   </p>
//                 </div>
//               ) : (
//                 <AIRiskAnalysis
//                   risks={aiRisks}
//                 />
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </main>
//   );
// }

