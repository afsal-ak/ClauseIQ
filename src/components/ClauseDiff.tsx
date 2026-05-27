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
  // unchanged
  if (
    status ===
    "UNCHANGED"
  ) {
    return (
      <div className="mt-4 rounded-xl border p-4">
        <p className="font-medium mb-2">
          Clause
        </p>

        <p className="text-sm text-muted-foreground leading-7">
          {oldText}
        </p>
      </div>
    );
  }

  // added
  if (
    status ===
    "ADDED"
  ) {
    return (
      <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
        <p className="font-semibold text-green-800 mb-2">
          New Clause
        </p>

        <p className="text-sm leading-7 text-green-900">
          {newText}
        </p>
      </div>
    );
  }

  // removed
  if (
    status ===
    "REMOVED"
  ) {
    return (
      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="font-semibold text-red-700 mb-2">
          Removed Clause
        </p>

        <p className="text-sm leading-7 line-through text-red-700">
          {oldText}
        </p>
      </div>
    );
  }

  // modified
  const oldParts =
    diff?.filter(
      (part) =>
        !part.added
    ) || [];

  const newParts =
    diff?.filter(
      (part) =>
        !part.removed
    ) || [];

  return (
    <div className="mt-4 space-y-4">
      {/* OLD */}
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="font-semibold text-red-700 mb-2">
          Old Clause
        </p>

        <div className="text-sm leading-8">
          {oldParts.map(
            (
              part,
              index
            ) => (
              <span
                key={index}
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
      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <p className="font-semibold text-green-700 mb-2">
          New Clause
        </p>

        <div className="text-sm leading-8">
          {newParts.map(
            (
              part,
              index
            ) => (
              <span
                key={index}
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
    </div>
  );
}