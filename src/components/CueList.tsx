import type { Cue, SortOption } from "@/data/focusblock";
import { SORT_OPTIONS } from "@/data/focusblock";
import { TABS, tabOf, sortCues, type TabName } from "@/lib/cues";
import { ToolIcon, UrgencyFlag } from "@/components/bits";
import { Dot } from "lucide-react";

export function CueList({
  cues,
  tab,
  onTab,
  sort,
  onSort,
  selectedId,
  onSelect,
  firstFlagRef,
}: {
  cues: Cue[];
  tab: TabName;
  onTab: (t: TabName) => void;
  sort: SortOption;
  onSort: (s: SortOption) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  firstFlagRef?: string;
}) {
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
          <li key={cue.id}>
            <button
              type="button"
              onClick={() => onSelect(cue.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                selectedId === cue.id ? "bg-accent-soft" : "hover:bg-muted"
              }`}
            >
              <ToolIcon tool={cue.tool} />
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
          </li>
        ))}
      </ul>
    </div>
  );
}
