import { useEffect, useState } from "react";

export type TourStep = {
  anchor: string;
  title: string;
  body: string;
};

export const TOUR_STEPS: TourStep[] = [
  {
    anchor: "left-panel",
    title: "Your Blocks",
    body: "Each one is a project, and the number is how many things in it need you.",
  },
  {
    anchor: "start-button",
    title: "Start a FocusBlock",
    body: "Pick a Block and a length of time. FocusBlock shows you what to handle first.",
  },
  {
    anchor: "urgency-flag",
    title: "The urgency flag",
    body: "The flag is how urgent the AI thinks this is. Hover to see why.",
  },
  {
    anchor: "right-panel",
    title: "Act from here",
    body: "Draft with AI writes the reply. You edit and send.",
  },
  {
    anchor: "nav-integrations",
    title: "Integrations",
    body: "FocusBlock reads from the tools you already use. Connect them here.",
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
