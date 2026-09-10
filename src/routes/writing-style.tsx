import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Sparkles, Upload, X } from "lucide-react";

export const Route = createFileRoute("/writing-style")({
  head: () => ({
    meta: [
      { title: "Writing style, FocusBlock prototype" },
      {
        name: "description",
        content:
          "Add examples of how you write. FocusBlock turns them into a style guide that Draft with AI follows.",
      },
      { property: "og:title", content: "Writing style, FocusBlock prototype" },
      {
        property: "og:description",
        content:
          "Add examples of how you write. FocusBlock turns them into a style guide that Draft with AI follows.",
      },
    ],
  }),
  component: WritingStylePage,
});

/* Everything on this page is simulated. The examples are invented, and the generated guide is
   pre-written text shown after a short pause. No model is called. */

type Example = { id: string; source: string; text: string };

const SEED_EXAMPLES: Example[] = [
  {
    id: "ex-1",
    source: "Slack, #checkout-redesign",
    text: "Yes, ship it. Priya marked the error state final on Tuesday, so nothing is waiting on design. If staging turns anything up, ping me and I will look the same day.",
  },
  {
    id: "ex-2",
    source: "Email to Sam",
    text: "Roll back the label format for warehouse B only and send me three of the failing labels. I want to see what the scanner is rejecting before we decide whether warehouse A follows.",
  },
  {
    id: "ex-3",
    source: "Jira comment, SHOP-482",
    text: "Put the apartment-number case in a follow-up ticket. It widens the diff we are about to send to staging and it is not what the ticket is for.",
  },
];

const GENERATED_GUIDE = [
  {
    rule: "Lead with the decision.",
    detail: "The first sentence is the answer: ship it, roll it back, follow-up ticket. The reason comes after.",
  },
  {
    rule: "One reason, in the same breath.",
    detail: "Every decision carries exactly one because, right after it. No list of justifications.",
  },
  {
    rule: "Short sentences, joined with and.",
    detail: "No semicolons. A long thought becomes two sentences or an and-joined pair.",
  },
  {
    rule: "Name the next step and who does it.",
    detail: "Messages end on an action with an owner: send me three labels, ping me and I will look.",
  },
  {
    rule: "Plain words, no softening.",
    detail: "No just, no I think, no sorry to bother. The ask stands on its own.",
  },
  {
    rule: "Say what you will do, with a time.",
    detail: "Commitments are specific: the same day, before we decide, in a follow-up ticket.",
  },
];

function WritingStylePage() {
  const [examples, setExamples] = useState<Example[]>(SEED_EXAMPLES);
  const [draft, setDraft] = useState("");
  const [source, setSource] = useState("");
  const [state, setState] = useState<"idle" | "generating" | "ready">("idle");
  const fileInput = useRef<HTMLInputElement>(null);

  // The pause is driven by state so a re-render can never strand it in "generating".
  useEffect(() => {
    if (state !== "generating") return;
    const id = setTimeout(() => setState("ready"), 1400);
    return () => clearTimeout(id);
  }, [state]);

  function generate() {
    setState("generating");
  }

  function addFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const isText = /\.(txt|md|eml|csv)$/i.test(file.name) || file.type.startsWith("text/");
      const add = (text: string) =>
        setExamples((list) => [
          ...list,
          { id: `ex-${Date.now()}-${file.name}`, source: `Uploaded, ${file.name}`, text },
        ]);
      if (isText) {
        file.text().then((t) => add(t.trim().slice(0, 1200) || `(${file.name} was empty)`));
      } else {
        add(`${file.name}, ${Math.max(1, Math.round(file.size / 1024))} KB. Read as an example of how you write.`);
      }
    });
    setState("idle");
  }

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <h1 className="text-xl font-medium tracking-tight">Writing style</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Add examples of messages you wrote. FocusBlock reads them and writes a style guide, and Draft
        with AI follows it, so drafts sound like you and need less editing.
      </p>

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-8">
        <section>
          <h2 className="text-sm font-medium">Your examples</h2>
          <ul className="mt-3 space-y-3">
            {examples.map((ex) => (
              <li key={ex.id} className="card-soft relative p-4">
                <p className="text-xs text-muted-foreground">{ex.source}</p>
                <p className="mt-1.5 text-sm leading-relaxed">{ex.text}</p>
                <button
                  type="button"
                  aria-label="Remove example"
                  onClick={() => {
                    setExamples((list) => list.filter((e) => e.id !== ex.id));
                    setState("idle");
                  }}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </li>
            ))}
          </ul>

          <form
            className="card-soft mt-4 p-4"
            onSubmit={(e) => {
              e.preventDefault();
              const t = draft.trim();
              if (!t) return;
              setExamples((list) => [
                ...list,
                { id: `ex-${Date.now()}`, source: source.trim() || "Pasted example", text: t },
              ]);
              setDraft("");
              setSource("");
              setState("idle");
            }}
          >
            <p className="text-sm font-medium">Add an example</p>
            <input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Where it is from (Slack, email, a ticket comment)"
              className="mt-3 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={4}
              placeholder="Paste something you wrote"
              className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <div className="mt-3 flex items-center justify-between">
              <input
                ref={fileInput}
                type="file"
                multiple
                accept=".txt,.md,.eml,.csv,.pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                className="btn-base btn-quiet"
                onClick={() => fileInput.current?.click()}
              >
                <Upload className="mr-1.5 inline h-3.5 w-3.5" strokeWidth={1.5} />
                Upload files
              </button>
              <button type="submit" className="btn-base btn-quiet" disabled={!draft.trim()}>
                Add example
              </button>
            </div>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">
            Text files are read as examples. Other files are listed by name. Nothing leaves your browser.
          </p>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Your style guide</h2>
            <button
              type="button"
              className="btn-base btn-primary"
              disabled={examples.length === 0 || state === "generating"}
              onClick={generate}
            >
              <Sparkles className="mr-1.5 inline h-3.5 w-3.5" strokeWidth={1.5} />
              {state === "generating"
                ? "Reading your examples"
                : state === "ready"
                  ? "Generate again"
                  : "Generate style guide"}
            </button>
          </div>

          {state === "idle" && (
            <p className="card-soft mt-3 p-5 text-sm text-muted-foreground">
              Nothing generated yet. Add a few examples on the left, then generate. Three or more
              examples give a usable guide.
            </p>
          )}

          {state === "generating" && (
            <p className="card-soft mt-3 p-5 text-sm text-muted-foreground">
              Reading {examples.length} {examples.length === 1 ? "example" : "examples"} and pulling
              out the patterns.
            </p>
          )}

          {state === "ready" && (
            <div className="card-soft mt-3 p-5">
              <p className="text-xs text-muted-foreground">
                Built from {examples.length} {examples.length === 1 ? "example" : "examples"}. Draft
                with AI follows these rules.
              </p>
              <ol className="mt-4 space-y-3">
                {GENERATED_GUIDE.map((g, i) => (
                  <li key={g.rule} className="text-sm">
                    <span className="mr-2 text-xs text-muted-foreground">{i + 1}</span>
                    <span className="font-medium">{g.rule}</span>
                    <p className="mt-0.5 text-sm text-muted-foreground">{g.detail}</p>
                  </li>
                ))}
              </ol>
              <p className="mt-5 text-xs text-muted-foreground">
                The guide updates each time you add or remove an example and generate again.
              </p>
            </div>
          )}
        </section>
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        Simulated in this prototype. The examples are invented and the guide is pre-written; no model
        reads your text.
      </p>
    </div>
  );
}
