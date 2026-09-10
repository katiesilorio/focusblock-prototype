import { useState } from "react";
import { useApp } from "@/state/app-state";

const DURATIONS = [15, 30, 45, 60];

export function StartDialog({
  onClose,
  onStarted,
  fixedBlockId,
}: {
  onClose: () => void;
  onStarted: (blockId: string) => void;
  /** When set, the Block is already chosen and only the duration is asked. */
  fixedBlockId?: string;
}) {
  const app = useApp();
  const [blockId, setBlockId] = useState(fixedBlockId ?? app.blocks[0]?.id ?? "");
  const [minutes, setMinutes] = useState(30);
  const [custom, setCustom] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("");

  const fixedBlock = fixedBlockId ? app.blocks.find((b) => b.id === fixedBlockId) : undefined;
  const parsedCustom = Number.parseInt(customMinutes, 10);
  const customValid = Number.isInteger(parsedCustom) && parsedCustom >= 1 && parsedCustom <= 240;
  const chosenMinutes = custom ? (customValid ? parsedCustom : null) : minutes;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-float">
        <h2 className="text-base font-medium">Start a FocusBlock</h2>

        <p className="mt-5 text-xs text-muted-foreground">Block</p>
        {fixedBlock ? (
          <p className="mt-2 text-sm font-medium">{fixedBlock.name}</p>
        ) : (
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
        )}

        <p className="mt-5 text-xs text-muted-foreground">Duration</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {DURATIONS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setCustom(false);
                setMinutes(m);
              }}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                !custom && minutes === m
                  ? "border-accent bg-accent-soft"
                  : "border-border hover:bg-muted"
              }`}
            >
              {m} minutes
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCustom(true)}
            className={`rounded-md border px-3 py-1.5 text-sm ${
              custom ? "border-accent bg-accent-soft" : "border-border hover:bg-muted"
            }`}
          >
            Custom
          </button>
        </div>
        {custom && (
          <div className="mt-3 flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={240}
              autoFocus
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              placeholder="Minutes"
              className="w-28 rounded-md border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-accent"
            />
            <span className="text-xs text-muted-foreground">1 to 240 minutes</span>
          </div>
        )}

        <div className="mt-7 flex justify-end gap-2">
          <button type="button" className="btn-base btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-base btn-primary"
            disabled={chosenMinutes === null}
            onClick={() => {
              if (chosenMinutes === null) return;
              app.startSession(blockId, chosenMinutes);
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
