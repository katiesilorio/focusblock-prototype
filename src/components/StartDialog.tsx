import { useState } from "react";
import { useApp } from "@/state/app-state";

const DURATIONS = [15, 25, 45, 60];

export function StartDialog({
  onClose,
  onStarted,
}: {
  onClose: () => void;
  onStarted: (blockId: string) => void;
}) {
  const app = useApp();
  const [blockId, setBlockId] = useState(app.blocks[0]?.id ?? "");
  const [minutes, setMinutes] = useState(25);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-float">
        <h2 className="text-base font-medium">Start a FocusBlock</h2>

        <p className="mt-5 text-xs text-muted-foreground">Block</p>
        <div className="mt-2 space-y-1">
          {app.blocks.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setBlockId(b.id)}
              className={`block w-full rounded-md px-3 py-2 text-left text-sm ${
                blockId === b.id ? "bg-accent-soft text-foreground" : "hover:bg-muted"
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>

        <p className="mt-5 text-xs text-muted-foreground">Duration</p>
        <div className="mt-2 flex gap-2">
          {DURATIONS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMinutes(m)}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                minutes === m
                  ? "border-accent bg-accent-soft"
                  : "border-border hover:bg-muted"
              }`}
            >
              {m} minutes
            </button>
          ))}
        </div>

        <div className="mt-7 flex justify-end gap-2">
          <button type="button" className="btn-base btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-base btn-primary"
            onClick={() => {
              app.startSession(blockId, minutes);
              onStarted(blockId);
            }}
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
}
