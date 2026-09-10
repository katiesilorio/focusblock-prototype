import { useEffect, useState } from "react";

export type TourStep = {
  anchor: string;
  title: string;
  body: string;
};

export const TOUR_STEPS: TourStep[] = [
  {
    anchor: "nav-integrations",
    title: "Integrations",
    body: "FocusBlock reads from the tools you already use. Connect them here.",
  },
  {
    anchor: "left-panel",
    title: "Blocks",
    body: "Blocks represent a group of context or a project. The number is how many items need your attention.",
  },
  {
    anchor: "start-button",
    title: "Start a FocusBlock",
    body: "Pick a Block and a length of time. FocusBlock shows you what to handle first.",
  },
  {
    anchor: "cue-list",
    title: "The Block detail page",
    body: "Each item here is a Cue: one message, email, ticket, or comment. The summary at the top says what is going on. The tabs split Cues into what needs you, what is done, and what is just context. Sort by urgency, date, or open action items.",
  },
  {
    anchor: "urgency-flag",
    title: "Urgency",
    body: "The flag is how urgent the AI thinks a Cue is. Hover over it to see why.",
  },
  {
    anchor: "right-panel",
    title: "Take action on a Cue",
    body: "For replies or comments, Draft with AI, edit and send.",
  },
  {
    anchor: "unassigned",
    title: "Unassigned",
    body: "Context that does not belong to a Block yet lands here. Assign it to a Block, create one, or accept a Block the AI suggests.",
  },
];

export function Tour({
  step,
  onNext,
  onBack,
  onSkip,
}: {
  step: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  const current = TOUR_STEPS[step] ?? TOUR_STEPS[0]!;
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    const place = () => {
      const el = document.querySelector<HTMLElement>(`[data-tour="${current.anchor}"]`);
      if (!el) {
        setPos({ top: window.innerHeight / 2 - 80, left: window.innerWidth / 2 - 160 });
        return;
      }
      const r = el.getBoundingClientRect();
      const width = 320;
      let left = r.right + 16;
      if (left + width > window.innerWidth - 16) left = Math.max(16, r.left - width - 16);
      const top = Math.min(Math.max(16, r.top), window.innerHeight - 200);
      setPos({ top, left });
    };
    place();
    const id = window.setTimeout(place, 80);
    window.addEventListener("resize", place);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("resize", place);
    };
  }, [current.anchor, step]);

  if (!pos) return null;

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-40 bg-foreground/10" />
      <div
        className="fixed z-50 w-80 rounded-xl border border-border bg-surface p-5 shadow-float"
        style={{ top: pos.top, left: pos.left }}
      >
        <p className="text-sm font-medium">{current.title}</p>
        <p className="mt-1.5 text-sm text-muted-foreground">{current.body}</p>
        <div className="mt-5 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{step + 1} of {TOUR_STEPS.length}</span>
          <div className="flex items-center gap-2">
            <button type="button" className="btn-base btn-ghost" onClick={onSkip}>
              Skip tour
            </button>
            {step > 0 && (
              <button type="button" className="btn-base btn-quiet" onClick={onBack}>
                Back
              </button>
            )}
            <button type="button" className="btn-base btn-primary" onClick={onNext}>
              {step === TOUR_STEPS.length - 1 ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
