import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cueUrl, type Cue } from "@/data/focusblock";
import { ToolIcon, UrgencyFlag, Tag } from "@/components/bits";
import { useApp } from "@/state/app-state";

const STATUSES = ["To Do", "In Progress", "In Review", "Done"];

export function CuePanel({
  cue,
  onClose,
  unassignedMode = false,
}: {
  cue: Cue;
  onClose: () => void;
  unassignedMode?: boolean;
}) {
  const app = useApp();
  const [text, setText] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [menu, setMenu] = useState<"none" | "snooze" | "reassign" | "status">("none");
  const [newBlockName, setNewBlockName] = useState("");

  useEffect(() => {
    setText("");
    setMenu("none");
    setNewBlockName("");
  }, [cue.id]);

  const replyLabel =
    cue.tool === "Jira" ? "Comment" : cue.tool === "Google Drive" ? "Reply to comment" : "Reply";

  return (
    <aside
      data-tour="right-panel"
      className="flex h-full w-[420px] shrink-0 flex-col overflow-y-auto border-l border-border bg-surface"
    >
      <div className="flex items-start justify-between px-6 pt-6">
        <a
          href={cueUrl(cue)}
          target="_blank"
          rel="noreferrer"
          title={`Open in ${cue.tool}`}
          className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <ToolIcon tool={cue.tool} driveKind={cue.driveKind} />
          <span>{cue.tool}</span>
          <span>/</span>
          <span className="truncate underline underline-offset-2">{cue.origin}</span>
        </a>
        <button type="button" onClick={onClose} className="btn-ghost -mr-1 rounded-md p-1">
          <X className="h-4 w-4" strokeWidth={1.5} />
          <span className="sr-only">Close</span>
        </button>
      </div>

      <div className="px-6 pb-6 pt-4">
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium">{cue.sender}</p>
          <p className="text-xs text-muted-foreground">{cue.time}</p>
          {cue.ticketStatus && <Tag>{cue.ticketStatus}</Tag>}
        </div>

        <div className="mt-3 flex items-start gap-2">
          <UrgencyFlag urgency={cue.urgency} reason={cue.reason} withLabel />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{cue.reason}</p>

        <p className="mt-4 text-sm leading-relaxed">{cue.body}</p>

        {cue.openActionItem && cue.ask && (
          <p className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-xs text-foreground">
            <span className="font-medium">Open action item:</span> {cue.ask}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {cue.tool === "Jira" &&
            (cue.ticketKey === "OPS-207" ? (
              <button
                type="button"
                className="btn-base btn-quiet"
                onClick={() => app.moveToUat(cue.id)}
              >
                Move to UAT
              </button>
            ) : (
              <button
                type="button"
                className="btn-base btn-quiet"
                onClick={() => setMenu(menu === "status" ? "none" : "status")}
              >
                Change status
              </button>
            ))}

          <button type="button" className="btn-base btn-quiet" onClick={() => app.markDone(cue.id)}>
            Mark done
          </button>
          <button
            type="button"
            className="btn-base btn-quiet"
            onClick={() => setMenu(menu === "snooze" ? "none" : "snooze")}
          >
            Snooze
          </button>
          <button
            type="button"
            className="btn-base btn-quiet"
            onClick={() => setMenu(menu === "reassign" ? "none" : "reassign")}
          >
            {unassignedMode ? "Assign to a Block" : "Reassign"}
          </button>
        </div>

        {menu === "status" && (
          <div className="card-soft mt-3 p-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  app.changeStatus(cue.id, s);
                  setMenu("none");
                }}
                className="block w-full rounded-md px-3 py-1.5 text-left text-sm hover:bg-muted"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {menu === "snooze" && (
          <div className="card-soft mt-3 p-2">
            {["Until tomorrow", "Until next week"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  app.snooze(cue.id, s.toLowerCase());
                  setMenu("none");
                  onClose();
                }}
                className="block w-full rounded-md px-3 py-1.5 text-left text-sm hover:bg-muted"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {menu === "reassign" && (
          <div className="card-soft mt-3 p-2">
            {app.blocks.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  app.reassign(cue.id, b.id);
                  setMenu("none");
                  onClose();
                }}
                className="block w-full rounded-md px-3 py-1.5 text-left text-sm hover:bg-muted"
              >
                {b.name}
              </button>
            ))}
            <form
              className="mt-1 flex items-center gap-2 border-t border-border px-1 pt-2"
              onSubmit={(e) => {
                e.preventDefault();
                const n = newBlockName.trim();
                if (!n) return;
                const id = app.createBlock(n, []);
                app.reassign(cue.id, id);
                setMenu("none");
                onClose();
              }}
            >
              <input
                value={newBlockName}
                onChange={(e) => setNewBlockName(e.target.value)}
                placeholder="Or create a new Block"
                className="flex-1 rounded-md border border-border bg-surface px-2 py-1.5 text-sm outline-none focus:border-accent"
              />
              <button type="submit" className="btn-base btn-quiet" disabled={!newBlockName.trim()}>
                Create
              </button>
            </form>
          </div>
        )}

        <div className="mt-6">
          <p className="text-xs text-muted-foreground">{replyLabel}</p>
          <div className="mt-1.5">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder={`Write your ${replyLabel.toLowerCase()}`}
              className="w-full rounded-lg border border-border bg-surface p-3 text-sm outline-none focus:border-accent"
            />
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                className="btn-base btn-quiet"
                disabled={drafting}
                onClick={() => {
                  setDrafting(true);
                  setTimeout(() => {
                    setText(cue.draft);
                    setDrafting(false);
                  }, 600);
                }}
              >
                {drafting ? "Drafting" : "Draft with AI"}
              </button>
              <button
                type="button"
                className="btn-base btn-primary"
                disabled={!text.trim()}
                onClick={() => {
                  app.sendReply(cue.id, text);
                  setText("");
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {cue.history && cue.history.length > 0 && (
          <div className="mt-6 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">Your activity on this</p>
            <ul className="mt-2 space-y-2">
              {cue.history.map((h, i) => (
                <li key={i} className="text-xs">
                  <span className="text-muted-foreground">{h.at}</span>{" "}
                  <span className="font-medium">{h.label}</span>
                  {h.detail && (
                    <p className="mt-0.5 whitespace-pre-line rounded-md bg-accent-soft px-2.5 py-1.5 text-muted-foreground">
                      {h.detail}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}
