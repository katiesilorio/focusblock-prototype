import type { Cue, SortOption } from "@/data/focusblock";
import { SORT_OPTIONS } from "@/data/focusblock";
import { TABS, tabOf, sortCues, type TabName } from "@/lib/cues";
import { ToolIcon, UrgencyFlag } from "@/components/bits";
import { Dot, FolderInput } from "lucide-react";
import { useState } from "react";

export function CueList({
  cues,
  tab,
  onTab,
  sort,
  onSort,
  selectedId,
  onSelect,
  firstFlagRef,
  quickAssign,
}: {
  cues: Cue[];
  tab: TabName;
  onTab: (t: TabName) => void;
  sort: SortOption;
  onSort: (s: SortOption) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  firstFlagRef?: string | undefined;
  /** When given, each row gets an inline "Assign to" select (used in the Unassigned view). */
  quickAssign?: {
    blocks: { id: string; name: string }[];
    onAssign: (cueId: string, blockId: string) => void;
    onCreate: (cueId: string, name: string) => void;
  };
}) {
  const [assignOpen, setAssignOpen] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const counts: Record<TabName, number> = {
    "Action required": 0,
    Resolved: 0,
    "Additional context": 0,
  };
  cues.forEach((c) => {
    counts[tabOf(c)] += 1;
  });

  const visible = sortCues(
    cues.filter((c) => tabOf(c) === tab),
    sort,
  );

  return (
    <div>
      <div className="flex items-end justify-between border-b border-border">
        <div className="flex gap-6">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onTab(t)}
              className={`-mb-px border-b-2 pb-2 text-sm transition-colors ${
                t === tab
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}{" "}
              <span className="ml-1 text-xs text-muted-foreground tabular-nums">{counts[t]}</span>
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 pb-2 text-xs text-muted-foreground">
          Sort
          <select
            value={sort}
            onChange={(e) => onSort(e.target.value as SortOption)}
            className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-foreground"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="mt-2">
        {visible.length === 0 && (
          <li className="px-1 py-10 text-sm text-muted-foreground">Nothing here right now.</li>
        )}
        {visible.map((cue) => (
          <li key={cue.id} className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onSelect(cue.id)}
              className={`flex min-w-0 flex-1 items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                selectedId === cue.id ? "bg-accent-soft" : "hover:bg-muted"
              }`}
            >
              <ToolIcon tool={cue.tool} driveKind={cue.driveKind} />
              <span className="w-36 shrink-0 truncate text-sm font-medium">{cue.sender}</span>
              <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                {cue.preview}
              </span>
              {cue.replied && (
                <span className="shrink-0 text-[11px] text-muted-foreground">Replied</span>
              )}
              {cue.snoozed && !cue.resolved && (
                <span className="shrink-0 text-[11px] text-muted-foreground">Snoozed</span>
              )}
              {cue.openActionItem && !cue.resolved && (
                <span className="flex shrink-0 items-center text-[11px] text-muted-foreground">
                  <Dot className="h-4 w-4" /> Open action item
                </span>
              )}
              <span className="w-28 shrink-0 text-right text-xs text-muted-foreground">
                {cue.time}
              </span>
              <span
                className="shrink-0"
                data-tour={firstFlagRef === cue.id ? "urgency-flag" : undefined}
              >
                <UrgencyFlag urgency={cue.urgency} reason={cue.reason} />
              </span>
            </button>
            {quickAssign && (
              <div className="relative shrink-0">
                <button
                  type="button"
                  aria-label="Assign to a Block"
                  title="Assign to a Block"
                  onClick={(e) => {
                    e.stopPropagation();
                    setNewName("");
                    setAssignOpen(assignOpen === cue.id ? null : cue.id);
                  }}
                  className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <FolderInput className="h-4 w-4" strokeWidth={1.5} />
                </button>
                {assignOpen === cue.id && (
                  <div className="absolute right-0 top-8 z-20 w-64 rounded-xl border border-border bg-surface p-2 shadow-float">
                    <p className="px-2 pb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                      Assign to a Block
                    </p>
                    {quickAssign.blocks.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          quickAssign.onAssign(cue.id, b.id);
                          setAssignOpen(null);
                        }}
                        className="block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                      >
                        {b.name}
                      </button>
                    ))}
                    <form
                      className="mt-1 flex items-center gap-1.5 border-t border-border px-1 pt-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const n = newName.trim();
                        if (!n) return;
                        quickAssign.onCreate(cue.id, n);
                        setAssignOpen(null);
                      }}
                    >
                      <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="New Block"
                        className="min-w-0 flex-1 rounded-md border border-border bg-surface px-2 py-1 text-sm outline-none focus:border-accent"
                      />
                      <button type="submit" className="btn-base btn-quiet" disabled={!newName.trim()}>
                        Create
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
