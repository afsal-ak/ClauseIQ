"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ClauseDiffProps {
  diff?: {
    value: string;
    added?: boolean;
    removed?: boolean;
  }[];

  oldText?: string;
  newText?: string;

  status: string;
}

export default function ClauseDiff({
  diff,
  oldText,
  newText,
  status,
}: ClauseDiffProps) {
  // changed clauses expanded first
  const [expanded, setExpanded] =
    useState(
      status !== "UNCHANGED"
    );

  const oldLength =
    oldText?.length || 0;

  const newLength =
    newText?.length || 0;

  const diffLength =
    diff?.reduce(
      (
        acc,
        item
      ) =>
        acc +
        item.value.length,
      0
    ) || 0;

  const shouldCollapse =
    oldLength > 120 ||
    newLength > 120 ||
    diffLength > 120 ||
    (diff?.length || 0) > 4;
  const textClass = expanded
    ? "text-sm leading-7"
    : "text-sm leading-7 line-clamp-3 overflow-hidden";

  const ToggleButton = () =>
    shouldCollapse ? (
      <button
        onClick={() =>
          setExpanded(
            !expanded
          )
        }
        className="mt-4 inline-flex items-center gap-2 text-primary text-sm font-medium hover:opacity-80 transition"
      >
        {expanded ? (
          <>
            <ChevronUp className="w-4 h-4" />
            Read less
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            Read more
          </>
        )}
      </button>
    ) : null;

  // UNCHANGED
  if (
    status ===
    "UNCHANGED"
  ) {
    return (
      <div className="mt-4 rounded-2xl border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="font-medium">
            Clause
          </p>

          <span className="text-xs bg-muted px-3 py-1 rounded-full">
            No changes
          </span>
        </div>

        <p
          className={`text-muted-foreground ${textClass}`}
        >
          {oldText}
        </p>

        <ToggleButton />
      </div>
    );
  }

  // ADDED
  if (
    status ===
    "ADDED"
  ) {
    return (
      <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-green-700">
            New Clause
          </p>

          <span className="text-xs bg-green-200 text-green-800 px-3 py-1 rounded-full">
            Added
          </span>
        </div>

        <p
          className={`text-green-900 ${textClass}`}
        >
          {newText}
        </p>

        <ToggleButton />
      </div>
    );
  }

  // REMOVED
  if (
    status ===
    "REMOVED"
  ) {
    return (
      <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-red-700">
            Removed Clause
          </p>

          <span className="text-xs bg-red-200 text-red-800 px-3 py-1 rounded-full">
            Removed
          </span>
        </div>

        <p
          className={`line-through text-red-700 ${textClass}`}
        >
          {oldText}
        </p>

        <ToggleButton />
      </div>
    );
  }

  // MODIFIED
  return (
    <div className="mt-4 space-y-4">
      {/* OLD */}
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-red-700">
            Old Clause
          </p>

          <span className="text-xs bg-red-200 text-red-800 px-3 py-1 rounded-full">
            Before
          </span>
        </div>

        <div
          className={
            expanded
              ? "text-sm leading-8"
              : "text-sm leading-8 line-clamp-3 overflow-hidden"
          }
        >
          {diff
            ?.filter(
              (
                part
              ) =>
                !part.added
            )
            .map(
              (
                part,
                index
              ) => (
                <span
                  key={
                    index
                  }
                  className={
                    part.removed
                      ? "bg-red-300 text-red-900 line-through rounded px-1 font-medium"
                      : ""
                  }
                >
                  {
                    part.value
                  }
                </span>
              )
            )}
        </div>
      </div>

      {/* NEW */}
      <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-green-700">
            New Clause
          </p>

          <span className="text-xs bg-green-200 text-green-800 px-3 py-1 rounded-full">
            After
          </span>
        </div>

        <div
          className={
            expanded
              ? "text-sm leading-8"
              : "text-sm leading-8 line-clamp-3 overflow-hidden"
          }
        >
          {diff
            ?.filter(
              (
                part
              ) =>
                !part.removed
            )
            .map(
              (
                part,
                index
              ) => (
                <span
                  key={
                    index
                  }
                  className={
                    part.added
                      ? "bg-green-300 text-green-900 rounded px-1 font-medium"
                      : ""
                  }
                >
                  {
                    part.value
                  }
                </span>
              )
            )}
        </div>
      </div>

      <ToggleButton />
    </div>
  );
}