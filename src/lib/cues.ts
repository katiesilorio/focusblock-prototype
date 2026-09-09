import type { Cue, SortOption } from "@/data/focusblock";

const urgencyRank: Record<string, number> = { Blocking: 0, "Action needed": 1, FYI: 2 };

export type TabName = "Action required" | "Resolved" | "Additional context";
export const TABS: TabName[] = ["Action required", "Resolved", "Additional context"];

export function tabOf(cue: Cue): TabName {
  if (cue.resolved) return "Resolved";
  if (cue.snoozed) return "Additional context";
  if (cue.urgency === "FYI") return "Additional context";
  return "Action required";
}

export function sortCues(cues: Cue[], sort: SortOption): Cue[] {
  const list = [...cues];
  if (sort === "Newest first") return list.sort((a, b) => a.minutesAgo - b.minutesAgo);
  if (sort === "Oldest first") return list.sort((a, b) => b.minutesAgo - a.minutesAgo);
  if (sort === "Open action items first")
    return list.sort(
      (a, b) =>
        Number(b.openActionItem) - Number(a.openActionItem) ||
        urgencyRank[a.urgency] - urgencyRank[b.urgency],
    );
  return list.sort(
    (a, b) => urgencyRank[a.urgency] - urgencyRank[b.urgency] || a.minutesAgo - b.minutesAgo,
  );
}
