import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { X } from "lucide-react";
import { useApp } from "@/state/app-state";
import { SUGGESTED_BLOCK, type Priority } from "@/data/focusblock";

export const Route = createFileRoute("/blocks")({
  head: () => ({
    meta: [
      { title: "Blocks, FocusBlock prototype" },
      {
        name: "description",
        content:
          "Configure Blocks: a name, a priority, and the channels, documents, tickets, and threads their context comes from.",
      },
      { property: "og:title", content: "Blocks, FocusBlock prototype" },
      {
        property: "og:description",
        content:
          "Configure Blocks: a name, a priority, and the channels, documents, tickets, and threads their context comes from.",
      },
    ],
  }),
  component: BlocksPage,
});

function BlocksPage() {
  const app = useApp();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [priority, setPriority] = useState<Priority>("Normal");
  const [link, setLink] = useState("");
  const [suggestionName, setSuggestionName] = useState(SUGGESTED_BLOCK.name);

  const suggestionCues = app.cues.filter((c) => SUGGESTED_BLOCK.cueIds.includes(c.id));

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium tracking-tight">Blocks</h1>
        <button type="button" className="btn-base btn-primary" onClick={() => setCreating(true)}>
          Create a Block
        </button>
      </div>

      {app.suggestionState === "open" && (
        <div className="card-soft mt-6 p-5">
          <p className="text-sm font-medium">Suggested Block: {SUGGESTED_BLOCK.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">{SUGGESTED_BLOCK.description}</p>
          <ul className="mt-3 space-y-1">
            {suggestionCues.map((c) => (
              <li key={c.id} className="truncate text-xs text-muted-foreground">
                {c.tool}, {c.sender}: {c.preview}
              </li>
            ))}
          </ul>
          <input
            value={suggestionName}
            onChange={(e) => setSuggestionName(e.target.value)}
            className="mt-4 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="btn-base btn-primary"
              onClick={() => app.acceptSuggestion(suggestionName)}
            >
              Accept
            </button>
            <button type="button" className="btn-base btn-quiet" onClick={app.dismissSuggestion}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      {creating && (
        <div className="card-soft mt-6 p-5">
          <p className="text-sm font-medium">Create a Block</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Block name"
            className="mt-4 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <div className="mt-3 flex gap-2">
            {(["High", "Normal"] as Priority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`rounded-md border px-3 py-1.5 text-sm ${
                  priority === p ? "border-accent bg-accent-soft" : "border-border hover:bg-muted"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Add context, paste a link"
            className="mt-3 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              className="btn-base btn-primary"
              disabled={!name.trim()}
              onClick={() => {
                const id = app.createBlock(name.trim(), priority, []);
                if (link.trim()) app.addChip(id, link.trim());
                setName("");
                setLink("");
                setPriority("Normal");
                setCreating(false);
              }}
            >
              Save
            </button>
            <button type="button" className="btn-base btn-ghost" onClick={() => setCreating(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {app.blocks.map((b) => (
          <div key={b.id} className="card-soft p-5">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-medium">{b.name}</p>
              <p className="text-xs text-muted-foreground">{b.priority} priority</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{b.members.join(", ")}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {b.chips.map((chip) => (
                <span
                  key={chip.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                >
                  {chip.label}
                  <button
                    type="button"
                    onClick={() => app.removeChip(b.id, chip.id)}
                    className="hover:text-foreground"
                    aria-label={`Remove ${chip.label}`}
                  >
                    <X className="h-3 w-3" strokeWidth={2} />
                  </button>
                </span>
              ))}
            </div>

            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const value = (drafts[b.id] ?? "").trim();
                if (!value) return;
                app.addChip(b.id, value);
                setDrafts((d) => ({ ...d, [b.id]: "" }));
              }}
            >
              <input
                value={drafts[b.id] ?? ""}
                onChange={(e) => setDrafts((d) => ({ ...d, [b.id]: e.target.value }))}
                placeholder="Add context, paste a link"
                className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <button type="submit" className="btn-base btn-quiet">
                Add context
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
