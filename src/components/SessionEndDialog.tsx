import type { Counters } from "@/state/app-state";

export function SessionEndDialog({
  blockName,
  minutes,
  counters,
  onAnother,
  onClose,
}: {
  blockName: string;
  minutes: number;
  counters: Counters;
  onAnother: () => void;
  onClose: () => void;
}) {
  const rows: { label: string; value: string }[] = [];
  if (counters.replies > 0) rows.push({ label: "replies sent", value: String(counters.replies) });
  if (counters.comments > 0)
    rows.push({ label: "comments posted", value: String(counters.comments) });
  if (counters.resolved > 0) rows.push({ label: "cues resolved", value: String(counters.resolved) });
  if (counters.ticketsProgressed.length > 0)
    rows.push({
      label: `tickets progressed, ${counters.ticketsProgressed.join(", ")}`,
      value: String(counters.ticketsProgressed.length),
    });
  if (counters.words > 0) rows.push({ label: "words written", value: String(counters.words) });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 text-center shadow-float">
        <h2 className="text-lg font-medium">Session complete</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {blockName}, {minutes} minutes
        </p>

        {rows.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            Nothing marked done this session. The list will be here when you are back.
          </p>
        ) : (
          <ul className="mt-7 space-y-4 text-left">
            {rows.map((r) => (
              <li key={r.label} className="flex items-baseline gap-3">
                <span className="w-14 text-right text-3xl font-medium tabular-nums text-accent">
                  {r.value}
                </span>
                <span className="text-sm text-muted-foreground">{r.label}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 flex justify-center gap-2">
          <button type="button" className="btn-base btn-primary" onClick={onAnother}>
            Start another FocusBlock
          </button>
          <button type="button" className="btn-base btn-quiet" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
