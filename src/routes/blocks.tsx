import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { chipFromUrl, useApp } from "@/state/app-state";
import { chipUrl, SUGGESTED_BLOCK, type Priority } from "@/data/focusblock";
import { ChipIcon, ToolIcon } from "@/components/bits";

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
  const [links, setLinks] = useState<string[]>([""]);
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
              <li key={c.id} className="flex items-center gap-2 truncate text-xs text-muted-foreground">
                <ToolIcon tool={c.tool} className="h-3.5 w-3.5" />
                <span className="truncate">{c.sender}: {c.preview}</span>
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
          <p className="mt-4 text-xs text-muted-foreground">Priority</p>
          <div className="mt-1.5 flex gap-2">
            {(["High", "Normal", "Low"] as Priority[]).map((p) => (
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
          <p className="mt-4 text-xs text-muted-foreground">Context</p>
          <div className="mt-1.5 space-y-2">
            {links.map((value, i) => {
              const kind = value.trim() ? chipFromUrl(value.trim()).kind : "link";
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground">
                    <ChipIcon kind={kind} />
                  </span>
                  <input
                    value={value}
                    onChange={(e) =>
                      setLinks((ls) => ls.map((l, j) => (j === i ? e.target.value : l)))
                    }
                    placeholder="Paste a link to a Slack channel, doc, sheet, slides, email thread, or Jira ticket"
                    className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                  {links.length > 1 && (
                    <button
                      type="button"
                      aria-label="Remove link"
                      onClick={() => setLinks((ls) => ls.filter((_, j) => j !== i))}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              );
            })}
            <button
              type="button"
              onClick={() => setLinks((ls) => [...ls, ""])}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} /> Add another link
            </button>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              className="btn-base btn-primary"
              disabled={!name.trim()}
              onClick={() => {
                const chips = links.map((l) => l.trim()).filter(Boolean).map(chipFromUrl);
                app.createBlock(name.trim(), priority, chips);
                setName("");
                setLinks([""]);
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
                  <a
                    href={chipUrl(chip)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-foreground"
                  >
                    <ChipIcon kind={chip.kind} />
                    {chip.label}
                  </a>
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
