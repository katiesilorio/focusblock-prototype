import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  initialBlocks,
  initialCues,
  initialIntegrations,
  SUGGESTED_BLOCK,
  type Block,
  type ContextChip,
  type Cue,
  type Integration,
  type Priority,
} from "@/data/focusblock";

export type Counters = {
  replies: number;
  comments: number;
  resolved: number;
  ticketsProgressed: string[];
  words: number;
};

const emptyCounters: Counters = {
  replies: 0,
  comments: 0,
  resolved: 0,
  ticketsProgressed: [],
  words: 0,
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
  createBlock: (name: string, priority: Priority, chips: ContextChip[]) => string;
  addChip: (blockId: string, url: string) => void;
  removeChip: (blockId: string, chipId: string) => void;
  acceptSuggestion: (name: string) => void;
  dismissSuggestion: () => void;
  toggleIntegration: (id: string) => void;
  startSession: (blockId: string, minutes: number) => void;
  endSession: () => void;
  resetCounters: () => void;
  markDone: (cueId: string) => void;
  snooze: (cueId: string) => void;
  reassign: (cueId: string, blockId: string) => void;
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

  const value = useMemo<Ctx>(() => {
    const patchCue = (cueId: string, patch: Partial<Cue>) =>
      setCues((prev) => prev.map((c) => (c.id === cueId ? { ...c, ...patch } : c)));

    return {
      blocks,
      cues,
      integrations,
      suggestionState,
      session,
      counters,
      createBlock(name, priority, chips) {
        const id = `block-${Math.random().toString(36).slice(2, 8)}`;
        // Newest Block goes to the top of the list.
        setBlocks((prev) => [
          {
            id,
            name,
            priority,
            members: ["Maya Lindqvist"],
            chips,
            summary:
              "This Block is new, so FocusBlock has not seen enough context to summarize it yet. Anything you assign here will show up in Action required.",
            summaryAfterUnblock:
              "This Block is new, so FocusBlock has not seen enough context to summarize it yet. Anything you assign here will show up in Action required.",
          },
          ...prev,
        ]);
        return id;
      },
      addChip(blockId, url) {
        setBlocks((prev) =>
          prev.map((b) => (b.id === blockId ? { ...b, chips: [...b.chips, chipFromUrl(url)] } : b)),
        );
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
            priority: "Normal",
            members: ["Maya Lindqvist", "Dana Whitfield", "Sam Castillo"],
            chips: [
              { id: "d1", kind: "slack", label: "#general" },
              { id: "d2", kind: "email", label: "Thread with Dana Whitfield" },
              { id: "d3", kind: "jira", label: "OPS-241" },
            ],
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
        patchCue(cueId, { resolved: true, snoozed: false });
        setCounters((c) => ({ ...c, resolved: c.resolved + 1 }));
      },
      snooze(cueId) {
        patchCue(cueId, { snoozed: true });
      },
      reassign(cueId, blockId) {
        patchCue(cueId, { blockId });
      },
      sendReply(cueId, text) {
        const cue = cues.find((c) => c.id === cueId);
        patchCue(cueId, { replied: true });
        setCounters((c) => ({
          ...c,
          replies: cue && cue.tool !== "Jira" && cue.tool !== "Google Drive" ? c.replies + 1 : c.replies,
          comments:
            cue && (cue.tool === "Jira" || cue.tool === "Google Drive") ? c.comments + 1 : c.comments,
          words: c.words + countWords(text),
        }));
      },
      moveToUat(cueId) {
        const cue = cues.find((c) => c.id === cueId);
        patchCue(cueId, { ticketStatus: "UAT", resolved: true });
        setCounters((c) => ({
          ...c,
          resolved: c.resolved + 1,
          ticketsProgressed: [...c.ticketsProgressed, `${cue?.ticketKey ?? "Ticket"} to UAT`],
        }));
      },
      changeStatus(cueId, status) {
        const cue = cues.find((c) => c.id === cueId);
        patchCue(cueId, { ticketStatus: status });
        setCounters((c) => ({
          ...c,
          ticketsProgressed: [...c.ticketsProgressed, `${cue?.ticketKey ?? "Ticket"} to ${status}`],
        }));
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
