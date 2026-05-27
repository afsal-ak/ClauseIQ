"use client";

import { useState } from "react";
import {
  FileText,
  Loader2,
  Scale,
} from "lucide-react";
import { compareDocuments } from "@/services/comparison.service";

 
export default function Comparison() {
  const [oldFile, setOldFile] =
    useState<File | null>(null);

  const [newFile, setNewFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [comparison, setComparison] =
    useState<any[]>([]);

  const handleCompare =
    async () => {
      if (
        !oldFile ||
        !newFile
      )
        return;

      try {
        setLoading(true);

        const response =
          await compareDocuments(
            oldFile,
            newFile
          );

        setComparison(
          response.comparison ||
            []
        );
      } catch (
        error
      ) {
        console.error(
          error
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5">
            <Scale className="w-10 h-10 text-primary" />
          </div>

          <h1 className="text-4xl font-bold">
            ClauseIQ
          </h1>

          <p className="text-muted-foreground mt-2">
            Compare legal
            contracts and
            detect clause
            changes
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* OLD FILE */}
          <div className="border rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-4">
              Original
              Contract
            </h2>

            <input
              type="file"
              accept=".docx"
              onChange={(
                e
              ) =>
                setOldFile(
                  e.target
                    .files?.[0] ||
                    null
                )
              }
            />

            {oldFile && (
              <div className="mt-4 flex items-center gap-3">
                <FileText />

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
            )}
          </div>

          {/* NEW FILE */}
          <div className="border rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-4">
              Revised
              Contract
            </h2>

            <input
              type="file"
              accept=".docx"
              onChange={(
                e
              ) =>
                setNewFile(
                  e.target
                    .files?.[0] ||
                    null
                )
              }
            />

            {newFile && (
              <div className="mt-4 flex items-center gap-3">
                <FileText />

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
            )}
          </div>
        </div>

        <button
          onClick={
            handleCompare
          }
          disabled={
            loading ||
            !oldFile ||
            !newFile
          }
          className="w-full mt-6 bg-primary text-white py-4 rounded-xl font-medium flex justify-center items-center gap-2 disabled:opacity-50"
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
                    <div>
                      <h3 className="font-semibold">
                        {
                          item.title
                        }
                      </h3>

                      {item.oldText && (
                        <p className="text-sm mt-2 text-muted-foreground">
                          <span className="font-medium">
                            Old:
                          </span>{" "}
                          {item.oldText.slice(
                            0,
                            140
                          )}
                        </p>
                      )}

                      {item.newText && (
                        <p className="text-sm mt-2 text-muted-foreground">
                          <span className="font-medium">
                            New:
                          </span>{" "}
                          {item.newText.slice(
                            0,
                            140
                          )}
                        </p>
                      )}
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