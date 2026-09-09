import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/state/app-state";
import { CueList } from "@/components/CueList";
import { CuePanel } from "@/components/CuePanel";
import { StartDialog } from "@/components/StartDialog";
import { SessionEndDialog } from "@/components/SessionEndDialog";
import { Tour, TOUR_STEPS } from "@/components/Tour";
import { tabOf, sortCues, type TabName } from "@/lib/cues";
import { SUGGESTED_BLOCK, type SortOption } from "@/data/focusblock";
import { UrgencyFlag, ToolIcon } from "@/components/bits";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Focus, FocusBlock prototype" },
      {
        name: "description",
        content:
          "Work through the messages, emails, tickets, and document comments that actually need you, in timed focus sessions.",
      },
      { property: "og:title", content: "Focus, FocusBlock prototype" },
      {
        property: "og:description",
        content:
          "Work through the messages, emails, tickets, and document comments that actually need you, in timed focus sessions.",
      },
    ],
  }),
  component: FocusPage,
});

const TOUR_KEY = "focusblock-tour-seen";

function FocusPage() {
  const app = useApp();
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [unassignedOpen, setUnassignedOpen] = useState(false);
  const [tab, setTab] = useState<TabName>("Action required");
  const [sort, setSort] = useState<SortOption>("Urgency");
  const [selectedCueId, setSelectedCueId] = useState<string | null>(null);
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [endedInfo, setEndedInfo] = useState<{ name: string; minutes: number } | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [tourStep, setTourStep] = useState<number | null>(null);

  // Onboarding tour, the one remembered flag.
  useEffect(() => {
    if (window.localStorage.getItem(TOUR_KEY)) return;
    setTourStep(0);
  }, []);

  useEffect(() => {
    if (tourStep === null) return;
    const anchor = TOUR_STEPS[tourStep].anchor;
    if (anchor === "urgency-flag" || anchor === "right-panel") {
      setSelectedBlockId("checkout");
      setUnassignedOpen(false);
    }
    if (anchor === "right-panel") setSelectedCueId("cue-1");
  }, [tourStep]);

  const session = app.session;

  useEffect(() => {
    if (!session) return;
    const tick = () => {
      const left = session.minutes * 60 - Math.floor((Date.now() - session.startedAt) / 1000);
      setRemaining(Math.max(0, left));
      if (left <= 0) endSession();
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  function endSession() {
    if (!app.session) return;
    const block = app.blocks.find((b) => b.id === app.session!.blockId);
    setEndedInfo({ name: block?.name ?? "", minutes: app.session.minutes });
    app.endSession();
    setEndOpen(true);
  }

  const activeBlock = app.blocks.find((b) => b.id === selectedBlockId) ?? null;
  const blockCues = useMemo(
    () => app.cues.filter((c) => c.blockId === selectedBlockId),
    [app.cues, selectedBlockId],
  );
  const unassignedCues = useMemo(() => app.cues.filter((c) => c.blockId === null), [app.cues]);
  const selectedCue = app.cues.find((c) => c.id === selectedCueId) ?? null;

  const blockingResolved =
    activeBlock !== null &&
    blockCues.filter((c) => c.urgency === "Blocking").every((c) => c.resolved);

  const listCues = unassignedOpen ? unassignedCues : blockCues;
  const firstFlagId = sortCues(
    listCues.filter((c) => tabOf(c) === tab),
    sort,
  )[0]?.id;

  return (
    <div className="flex h-[calc(100vh-8.5rem)]">
      {/* Left panel */}
      <aside
        data-tour="left-panel"
        className="flex w-64 shrink-0 flex-col border-r border-border bg-surface px-4 py-6"
      >
        <p className="px-2 text-xs uppercase tracking-wide text-muted-foreground">Blocks</p>
        <ul className="mt-3 space-y-0.5">
          {app.blocks.map((b) => {
            const count = app.cues.filter(
              (c) => c.blockId === b.id && tabOf(c) === "Action required",
            ).length;
            return (
              <li key={b.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBlockId(b.id);
                    setUnassignedOpen(false);
                    setSelectedCueId(null);
                    setTab("Action required");
                  }}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm ${
                    selectedBlockId === b.id && !unassignedOpen
                      ? "bg-accent-soft text-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      b.priority === "High" ? "bg-foreground" : "bg-border"
                    }`}
                    title={`${b.priority} priority`}
                  />
                  <span className="min-w-0 flex-1 truncate">{b.name}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">{count}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={() => {
            setUnassignedOpen(true);
            setSelectedBlockId(null);
            setSelectedCueId(null);
            setTab("Action required");
          }}
          className={`mt-4 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm ${
            unassignedOpen ? "bg-accent-soft" : "hover:bg-muted"
          }`}
        >
          <span className="min-w-0 flex-1 truncate">Unassigned</span>
          <span className="text-xs tabular-nums text-muted-foreground">
            {unassignedCues.length}
          </span>
        </button>

        <Link
          to="/blocks"
          className="mt-auto px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          Manage Blocks
        </Link>
      </aside>

      {/* Main area */}
      <section className="min-w-0 flex-1 overflow-y-auto px-10 py-8">
        {!activeBlock && !unassignedOpen && (
          <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center text-center">
            <h1 className="text-2xl font-medium tracking-tight">Start a FocusBlock</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Pick a Block and how long you have. FocusBlock shows you what needs you first.
            </p>
            <button
              type="button"
              data-tour="start-button"
              className="btn-base btn-primary mt-7"
              onClick={() => setStartOpen(true)}
            >
              Start a FocusBlock
            </button>
          </div>
        )}

        {unassignedOpen && (
          <div>
            <h1 className="text-xl font-medium tracking-tight">Unassigned</h1>
            {app.suggestionState === "open" && (
              <div className="card-soft mt-5 p-5">
                <p className="text-sm font-medium">Suggested Block: {SUGGESTED_BLOCK.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{SUGGESTED_BLOCK.description}</p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    className="btn-base btn-primary"
                    onClick={() => app.acceptSuggestion(SUGGESTED_BLOCK.name)}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    className="btn-base btn-quiet"
                    onClick={() => app.dismissSuggestion()}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
            <div className="mt-6">
              <CueList
                cues={unassignedCues}
                tab={tab}
                onTab={setTab}
                sort={sort}
                onSort={setSort}
                selectedId={selectedCueId}
                onSelect={setSelectedCueId}
                firstFlagRef={firstFlagId}
              />
            </div>
          </div>
        )}

        {activeBlock && (
          <div>
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-medium tracking-tight">{activeBlock.name}</h1>
              {session && session.blockId === activeBlock.id ? (
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-medium tabular-nums text-accent">
                    {String(Math.floor(remaining / 60)).padStart(2, "0")}:
                    {String(remaining % 60).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={endSession}
                  >
                    End session now
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setStartOpen(true)}
                >
                  Start a FocusBlock on this Block
                </button>
              )}
            </div>

            <div className="card-soft mt-5 p-5">
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-medium">What is going on</p>
                <p className="text-xs text-muted-foreground">Summarized by FocusBlock</p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {blockingResolved ? activeBlock.summaryAfterUnblock : activeBlock.summary}
              </p>
            </div>

            <div className="mt-7">
              <CueList
                cues={blockCues}
                tab={tab}
                onTab={setTab}
                sort={sort}
                onSort={setSort}
                selectedId={selectedCueId}
                onSelect={setSelectedCueId}
                firstFlagRef={firstFlagId}
              />
            </div>
          </div>
        )}
      </section>

      {selectedCue && (
        <CuePanel
          cue={selectedCue}
          unassignedMode={unassignedOpen}
          onClose={() => setSelectedCueId(null)}
        />
      )}

      {startOpen && (
        <StartDialog
          onClose={() => setStartOpen(false)}
          onStarted={(blockId) => {
            setStartOpen(false);
            setSelectedBlockId(blockId);
            setUnassignedOpen(false);
            setSelectedCueId(null);
            setTab("Action required");
          }}
        />
      )}

      {endOpen && endedInfo && (
        <SessionEndDialog
          blockName={endedInfo.name}
          minutes={endedInfo.minutes}
          counters={app.counters}
          onAnother={() => {
            setEndOpen(false);
            setStartOpen(true);
          }}
          onClose={() => setEndOpen(false)}
        />
      )}

      {tourStep !== null && (
        <Tour
          step={tourStep}
          onNext={() => {
            if (tourStep === TOUR_STEPS.length - 1) {
              window.localStorage.setItem(TOUR_KEY, "yes");
              setTourStep(null);
            } else {
              setTourStep(tourStep + 1);
            }
          }}
          onBack={() => setTourStep(Math.max(0, tourStep - 1))}
          onSkip={() => {
            window.localStorage.setItem(TOUR_KEY, "yes");
            setTourStep(null);
          }}
        />
      )}
    </div>
  );
}
