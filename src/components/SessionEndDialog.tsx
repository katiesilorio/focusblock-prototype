import type { ReactNode } from "react";
import { ChipIcon } from "@/components/bits";
import type { Counters, SessionEvent } from "@/state/app-state";
import type { ChipKind } from "@/data/focusblock";

function firstName(full: string) {
  return full.split(" ")[0];
}

function joinNames(names: string[]) {
  const unique = Array.from(new Set(names));
  if (unique.length === 0) return "";
  if (unique.length === 1) return unique[0];
  if (unique.length === 2) return `${unique[0]} and ${unique[1]}`;
  return `${unique.slice(0, -1).join(", ")} and ${unique[unique.length - 1]}`;
}

function plural(n: number, one: string, many: string) {
  return n === 1 ? `1 ${one}` : `${n} ${many}`;
}

type Line = { icon: ChipKind; text: ReactNode; links: SessionEvent[] };

/** Turns the raw event list into the sentences the summary shows, with the links each one came from. */
function buildLines(events: SessionEvent[]): Line[] {
  const lines: Line[] = [];
  const by = (kind: SessionEvent["kind"], icon?: ChipKind) =>
    events.filter((e) => e.kind === kind && (icon ? e.icon === icon : true));

  const slackReplies = by("reply", "slack");
  if (slackReplies.length > 0)
    lines.push({
      icon: "slack",
      text: `Replied to ${plural(slackReplies.length, "Slack message", "Slack messages")}, ${joinNames(
        slackReplies.map((e) => firstName(e.person ?? "")),
      )}`,
      links: slackReplies,
    });

  const emails = by("reply", "email");
  if (emails.length > 0)
    lines.push({
      icon: "email",
      text: `Answered ${plural(emails.length, "email", "emails")} from ${joinNames(
        emails.map((e) => firstName(e.person ?? "")),
      )}`,
      links: emails,
    });

  const docComments = events.filter(
    (e) => e.kind === "comment" && (e.icon === "doc" || e.icon === "sheet" || e.icon === "slide"),
  );
  if (docComments.length > 0) {
    const kindWord = (k: ChipKind) => (k === "sheet" ? "sheet" : k === "slide" ? "deck" : "doc");
    lines.push({
      icon: docComments[0].icon,
      text:
        docComments.length === 1
          ? `Posted a comment on the ${docComments[0].label} ${kindWord(docComments[0].icon)}`
          : `Posted ${docComments.length} comments on ${joinNames(docComments.map((e) => e.label))}`,
      links: docComments,
    });
  }

  // Jira: a comment and a status move on the same ticket read as one line.
  const jiraComments = by("comment", "jira");
  const tickets = by("ticket");
  const handled = new Set<string>();
  jiraComments.forEach((c) => {
    const move = tickets.find((t) => t.label === c.label && !handled.has(t.label));
    handled.add(c.label);
    lines.push({
      icon: "jira",
      text: move ? `Commented on ${c.label} and moved it to ${move.detail}` : `Commented on ${c.label}`,
      links: move ? [c, move] : [c],
    });
  });
  tickets
    .filter((t) => !handled.has(t.label))
    .forEach((t) => {
      handled.add(t.label);
      lines.push({ icon: "jira", text: `Moved ${t.label} to ${t.detail}`, links: [t] });
    });

  // Marked done: one line per tool, so "cleared 2 Slack messages" reads as its own win.
  const doneWords: Record<ChipKind, [string, string]> = {
    slack: ["Slack message", "Slack messages"],
    email: ["email", "emails"],
    jira: ["Jira ticket", "Jira tickets"],
    doc: ["doc comment", "doc comments"],
    sheet: ["sheet comment", "sheet comments"],
    slide: ["deck comment", "deck comments"],
    link: ["cue", "cues"],
  };
  (["slack", "email", "jira", "doc", "sheet", "slide", "link"] as ChipKind[]).forEach((icon) => {
    const done = by("done", icon);
    if (done.length === 0) return;
    const [one, many] = doneWords[icon];
    lines.push({
      icon,
      text: `Cleared ${plural(done.length, one, many)}${
        icon === "slack" || icon === "email"
          ? `, ${joinNames(done.map((e) => firstName(e.person ?? "")).filter(Boolean))}`
          : ""
      }`,
      links: done,
    });
  });

  const context = by("context");
  if (context.length > 0) {
    const blocks = Array.from(new Set(context.map((e) => e.detail ?? "a Block")));
    lines.push({
      icon: context[0].icon,
      text: `Added ${plural(context.length, "piece of context", "pieces of context")} to ${joinNames(blocks)}`,
      links: context,
    });
  }

  return lines;
}

export function SessionEndDialog({
  blockName,
  minutes,
  counters,
  remaining,
  onAnother,
  onClose,
}: {
  blockName: string;
  minutes: number;
  counters: Counters;
  /** How many cues still sit in Action required for this Block. */
  remaining: number;
  onAnother: () => void;
  onClose: () => void;
}) {
  const lines = buildLines(counters.events);
  // Footnote numbers run across all lines so [1], [2], [3] never repeat.
  let n = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-6">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-8 shadow-float">
        <h2 className="text-3xl font-semibold tracking-tight text-accent">Nice work!</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {blockName}, {minutes} minutes
        </p>

        {lines.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            Nothing marked done this session. The list will be here when you are back.
          </p>
        ) : (
          <ul className="mt-6 space-y-3">
            {lines.map((line, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 shrink-0">
                  <ChipIcon kind={line.icon} className="h-4 w-4" />
                </span>
                <span>
                  {line.text}{" "}
                  {line.links.map((e) => {
                    n += 1;
                    return (
                      <a
                        key={`${e.url}-${n}`}
                        href={e.url}
                        target="_blank"
                        rel="noreferrer"
                        title={e.label}
                        className="ml-0.5 text-xs text-accent underline-offset-2 hover:underline"
                      >
                        [{n}]
                      </a>
                    );
                  })}
                </span>
              </li>
            ))}
            {counters.words > 0 && (
              <li className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 w-4 shrink-0" />
                <span>Wrote {counters.words} words</span>
              </li>
            )}
          </ul>
        )}

        <p className="mt-6 text-sm font-medium">
          {remaining === 0
            ? `${blockName} is clear for now.`
            : `${plural(remaining, "cue still needs", "cues still need")} you when you are back.`}
        </p>

        <div className="mt-8 flex gap-2">
          <button type="button" className="btn-base btn-primary" onClick={onAnother}>
            Start another FocusBlock
          </button>
          <button type="button" className="btn-base btn-quiet" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
