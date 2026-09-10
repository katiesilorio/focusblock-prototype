import { CircleDot, Link as LinkIcon } from "lucide-react";
import type { ChipKind, Tool, Urgency } from "@/data/focusblock";
import jiraLogo from "@/assets/logos/jira.png";
import gmailLogo from "@/assets/logos/gmail.png";
import sheetsLogo from "@/assets/logos/sheets.png";
import slidesLogo from "@/assets/logos/slides.png";
import docsLogo from "@/assets/logos/docs.png";
import slackLogo from "@/assets/logos/slack.png";

/*
 * Tool logos are the official marks of Slack, Atlassian (Jira), and Google (Gmail, Docs, Sheets, Slides),
 * used here only to show which tool a piece of context comes from. They belong to their owners.
 */

type DriveKind = "doc" | "sheet" | "slide";

const LOGOS = {
  slack: { src: slackLogo, name: "Slack" },
  gmail: { src: gmailLogo, name: "Gmail" },
  jira: { src: jiraLogo, name: "Jira" },
  doc: { src: docsLogo, name: "Google Doc" },
  sheet: { src: sheetsLogo, name: "Google Sheet" },
  slide: { src: slidesLogo, name: "Google Slides" },
} as const;

function Logo({ id, className }: { id: keyof typeof LOGOS; className: string }) {
  const l = LOGOS[id];
  return (
    <span title={l.name} className="inline-flex shrink-0 items-center">
      <img src={l.src} alt={l.name} className={`${className} object-contain`} />
    </span>
  );
}

export function ToolIcon({
  tool,
  driveKind,
  className = "h-4 w-4",
}: {
  tool: Tool;
  driveKind?: DriveKind | undefined;
  className?: string;
}) {
  if (tool === "Slack") return <Logo id="slack" className={className} />;
  if (tool === "Gmail") return <Logo id="gmail" className={className} />;
  if (tool === "Jira") return <Logo id="jira" className={className} />;
  return <Logo id={driveKind ?? "doc"} className={className} />;
}

/** Icon for a context chip, by the kind of link it is. */
export function ChipIcon({ kind, className = "h-3.5 w-3.5" }: { kind: ChipKind; className?: string }) {
  if (kind === "email") return <Logo id="gmail" className={className} />;
  if (kind === "link")
    return (
      <span title="Link" className="inline-flex">
        <LinkIcon className={className} strokeWidth={1.5} />
      </span>
    );
  return <Logo id={kind} className={className} />;
}

const urgencyColor: Record<Urgency, string> = {
  Blocking: "text-blocking",
  "Action needed": "text-action",
  FYI: "text-fyi",
};

export function UrgencyFlag({
  urgency,
  reason,
  withLabel = false,
}: {
  urgency: Urgency;
  reason: string;
  withLabel?: boolean;
}) {
  return (
    <span className={`group relative inline-flex items-center gap-1.5 text-xs ${urgencyColor[urgency]}`}>
      <CircleDot className="h-3.5 w-3.5" strokeWidth={2} />
      {withLabel ? <span>{urgency}</span> : <span className="sr-only">{urgency}</span>}
      <span
        role="tooltip"
        className="pointer-events-none absolute right-0 top-6 z-30 hidden w-64 rounded-lg border border-border bg-surface p-3 text-left text-xs text-foreground shadow-float group-hover:block"
      >
        <span className={`font-medium ${urgencyColor[urgency]}`}>{urgency}</span>
        <span className="mt-1 block text-muted-foreground">{reason}</span>
      </span>
    </span>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
      {children}
    </span>
  );
}
