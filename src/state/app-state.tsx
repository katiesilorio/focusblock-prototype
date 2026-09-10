import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  chipUrl,
  cueUrl,
  initialBlocks,
  initialCues,
  initialIntegrations,
  SUGGESTED_BLOCK,
  type Block,
  type ChipKind,
  type ContextChip,
  type Cue,
  type Integration,
} from "@/data/focusblock";

/** One thing the person did during a session, kept so the summary can link back to it. */
export type SessionEvent = {
  kind: "reply" | "comment" | "done" | "ticket" | "context";
  icon: ChipKind;
  /** Link text: channel, subject, ticket key, document or chip label. */
  label: string;
  url: string;
  /** Who the reply or comment went to. */
  person?: string;
  /** Extra words for the line, like a ticket's new status or the Block a chip was added to. */
  detail?: string;
};

const SUGGESTED_CHIPS: ContextChip[] = [
  { id: "d1", kind: "slack", label: "#general" },
  { id: "d2", kind: "email", label: "Thread with Dana Whitfield" },
  { id: "d3", kind: "jira", label: "OPS-241" },
];

function cueIcon(cue: Cue): ChipKind {
  if (cue.tool === "Slack") return "slack";
  if (cue.tool === "Jira") return "jira";
  if (cue.tool === "Gmail") return "email";
  return cue.driveKind ?? "doc";
}

export type Counters = {
  replies: number;
  comments: number;
  resolved: number;
  ticketsProgressed: string[];
  words: number;
  events: SessionEvent[];
};

const emptyCounters: Counters = {
  replies: 0,
  comments: 0,
  resolved: 0,
  ticketsProgressed: [],
  words: 0,
  events: [],
};

export type Session = {
  blockId: string;
  minutes: number;
  startedAt: number;
};

type State = {
  blocks: Block[];
  cues: Cue[];
  integrations: Integration[];
  suggestionState: "open" | "accepted" | "dismissed";
  session: Session | null;
  counters: Counters;
};

type Ctx = State & {
  createBlock: (name: string, chips: ContextChip[]) => string;
  addChip: (blockId: string, url: string) => void;
  removeChip: (blockId: string, chipId: string) => void;
  acceptSuggestion: (name: string) => void;
  dismissSuggestion: () => void;
  toggleIntegration: (id: string) => void;
  startSession: (blockId: string, minutes: number) => void;
  endSession: () => void;
  resetCounters: () => void;
  markDone: (cueId: string) => void;
  snooze: (cueId: string, until?: string) => void;
  reassign: (cueId: string, blockId: string) => void;
  /** Dismiss the AI's suggestion that a cue belongs to a Block. */
  dismissContextSuggestion: (cueId: string) => void;
  sendReply: (cueId: string, text: string) => void;
  moveToUat: (cueId: string) => void;
  changeStatus: (cueId: string, status: string) => void;
};

const AppContext = createContext<Ctx | null>(null);

export function chipFromUrl(url: string): ContextChip {
  const v = url.toLowerCase();
  const id = `chip-${Math.random().toString(36).slice(2, 9)}`;
  const label = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const href = url.startsWith("http") ? url : `https://${url}`;
  const base = { id, label, url: href };
  if (v.includes("slack")) return { ...base, kind: "slack" };
  if (v.includes("/spreadsheets") || v.includes("sheets.google")) return { ...base, kind: "sheet" };
  if (v.includes("/presentation") || v.includes("slides.google")) return { ...base, kind: "slide" };
  if (v.includes("docs.google") || v.includes("drive.google")) return { ...base, kind: "doc" };
  if (v.includes("atlassian") || v.includes("jira")) return { ...base, kind: "jira" };
  if (v.includes("mail") || v.includes("outlook")) return { ...base, kind: "email" };
  return { ...base, kind: "link" };
}

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [cues, setCues] = useState<Cue[]>(initialCues);
  const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrations);
  const [suggestionState, setSuggestionState] = useState<"open" | "accepted" | "dismissed">("open");
  const [session, setSession] = useState<Session | null>(null);
  const [counters, setCounters] = useState<Counters>(emptyCounters);

  function record(event: SessionEvent) {
    setCounters((c) => ({ ...c, events: [...c.events, event] }));
  }

  function recordChips(chips: ContextChip[], blockName: string) {
    chips.forEach((chip) =>
      record({ kind: "context", icon: chip.kind, label: chip.label, url: chipUrl(chip), detail: blockName }),
    );
  }

  const value = useMemo<Ctx>(() => {
    const patchCue = (cueId: string, patch: Partial<Cue>) =>
      setCues((prev) => prev.map((c) => (c.id === cueId ? { ...c, ...patch } : c)));
    const now = () =>
      new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const log = (cueId: string, label: string, detail?: string) =>
      setCues((prev) =>
        prev.map((c) =>
          c.id === cueId
            ? { ...c, history: [...(c.history ?? []), { at: now(), label, ...(detail ? { detail } : {}) }] }
            : c,
        ),
      );

    return {
      blocks,
      cues,
      integrations,
      suggestionState,
      session,
      counters,
      createBlock(name, chips) {
        const id = `block-${Math.random().toString(36).slice(2, 8)}`;
        // Newest Block goes to the top of the list.
        setBlocks((prev) => [
          {
            id,
            name,
            members: ["Maya Lindqvist"],
            chips,
            summary:
              "This Block is new, so FocusBlock has not seen enough context to summarize it yet. Anything you assign here will show up in Action required.",
            summaryAfterUnblock:
              "This Block is new, so FocusBlock has not seen enough context to summarize it yet. Anything you assign here will show up in Action required.",
          },
          ...prev,
        ]);
        recordChips(chips, name);
        return id;
      },
      addChip(blockId, url) {
        const chip = chipFromUrl(url);
        setBlocks((prev) =>
          prev.map((b) => (b.id === blockId ? { ...b, chips: [...b.chips, chip] } : b)),
        );
        recordChips([chip], blocks.find((b) => b.id === blockId)?.name ?? "a Block");
      },
      removeChip(blockId, chipId) {
        setBlocks((prev) =>
          prev.map((b) =>
            b.id === blockId ? { ...b, chips: b.chips.filter((c) => c.id !== chipId) } : b,
          ),
        );
      },
      acceptSuggestion(name) {
        const id = `block-doa`;
        setBlocks((prev) => [
          {
            id,
            name: name || SUGGESTED_BLOCK.name,
            members: ["Maya Lindqvist", "Dana Whitfield", "Sam Castillo"],
            chips: SUGGESTED_CHIPS,
            summary:
              "Three separate reports point at the same thing: parcels arriving crushed on one carrier route. Dana has the customer photos, Sam has the manual intake cost, and nobody owns the carrier conversation yet. Start by pulling the claims from that route for the last month.",
            summaryAfterUnblock:
              "The carrier conversation has an owner now. What is left is sizing the manual claim intake and deciding whether packaging changes as well.",
          },
          ...prev,
        ]);
        setCues((prev) =>
          prev.map((c) => (SUGGESTED_BLOCK.cueIds.includes(c.id) ? { ...c, blockId: id } : c)),
        );
        setSuggestionState("accepted");
        recordChips(SUGGESTED_CHIPS, name || SUGGESTED_BLOCK.name);
      },
      dismissSuggestion() {
        setSuggestionState("dismissed");
      },
      toggleIntegration(id) {
        setIntegrations((prev) =>
          prev.map((i) => (i.id === id ? { ...i, connected: !i.connected } : i)),
        );
      },
      startSession(blockId, minutes) {
        // Counters keep whatever was done since the last session ended, so ending early still shows it.
        setSession({ blockId, minutes, startedAt: Date.now() });
      },
      endSession() {
        setSession(null);
      },
      resetCounters() {
        setCounters(emptyCounters);
      },
      markDone(cueId) {
        const cue = cues.find((c) => c.id === cueId);
        patchCue(cueId, { resolved: true, snoozed: false });
        log(cueId, "Marked done");
        setCounters((c) => ({ ...c, resolved: c.resolved + 1 }));
        if (cue) record({ kind: "done", icon: cueIcon(cue), label: cue.origin, url: cueUrl(cue) });
      },
      snooze(cueId, until) {
        patchCue(cueId, { snoozed: true });
        log(cueId, `Snoozed ${until ?? ""}`.trim());
      },
      dismissContextSuggestion(cueId) {
        patchCue(cueId, { suggestionDismissed: true });
      },
      reassign(cueId, blockId) {
        patchCue(cueId, { blockId });
        const name = blocks.find((b) => b.id === blockId)?.name ?? "a new Block";
        log(cueId, `Moved to ${name}`);
      },
      sendReply(cueId, text) {
        const cue = cues.find((c) => c.id === cueId);
        patchCue(cueId, { replied: true });
        log(
          cueId,
          cue && (cue.tool === "Jira" || cue.tool === "Google Drive") ? "Comment posted" : "Reply sent",
          text,
        );
        setCounters((c) => ({
          ...c,
          replies: cue && cue.tool !== "Jira" && cue.tool !== "Google Drive" ? c.replies + 1 : c.replies,
          comments:
            cue && (cue.tool === "Jira" || cue.tool === "Google Drive") ? c.comments + 1 : c.comments,
          words: c.words + countWords(text),
        }));
        if (cue) {
          const isComment = cue.tool === "Jira" || cue.tool === "Google Drive";
          record({
            kind: isComment ? "comment" : "reply",
            icon: cueIcon(cue),
            label: cue.ticketKey ?? cue.origin,
            url: cueUrl(cue),
            person: cue.sender,
          });
        }
      },
      moveToUat(cueId) {
        const cue = cues.find((c) => c.id === cueId);
        patchCue(cueId, { ticketStatus: "UAT", resolved: true });
        log(cueId, "Moved to UAT");
        setCounters((c) => ({
          ...c,
          resolved: c.resolved + 1,
          ticketsProgressed: [...c.ticketsProgressed, `${cue?.ticketKey ?? "Ticket"} to UAT`],
        }));
        if (cue)
          record({ kind: "ticket", icon: "jira", label: cue.ticketKey ?? "Ticket", url: cueUrl(cue), detail: "UAT" });
      },
      changeStatus(cueId, status) {
        const cue = cues.find((c) => c.id === cueId);
        patchCue(cueId, { ticketStatus: status });
        log(cueId, `Status changed to ${status}`);
        setCounters((c) => ({
          ...c,
          ticketsProgressed: [...c.ticketsProgressed, `${cue?.ticketKey ?? "Ticket"} to ${status}`],
        }));
        if (cue)
          record({ kind: "ticket", icon: "jira", label: cue.ticketKey ?? "Ticket", url: cueUrl(cue), detail: status });
      },
    };
  }, [blocks, cues, integrations, suggestionState, session, counters]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppStateProvider");
  return ctx;
}
