import { FileText, Hash, Mail, Ticket, CircleDot, Table, Presentation, Link as LinkIcon } from "lucide-react";
import type { ChipKind, Tool, Urgency } from "@/data/focusblock";

export function ToolIcon({
  tool,
  driveKind,
  className = "h-4 w-4",
}: {
  tool: Tool;
  driveKind?: "doc" | "sheet" | "slide" | undefined;
  className?: string;
}) {
  const props = { className: `${className} text-muted-foreground`, strokeWidth: 1.5 };
  const driveName = driveKind === "sheet" ? "Google Sheet" : driveKind === "slide" ? "Google Slides" : "Google Doc";
  const icon =
    tool === "Slack" ? <Hash {...props} /> : tool === "Gmail" ? <Mail {...props} /> : tool === "Jira" ? <Ticket {...props} /> : driveKind === "sheet" ? <Table {...props} /> : driveKind === "slide" ? <Presentation {...props} /> : <FileText {...props} />;
  return <span title={tool === "Google Drive" ? driveName : tool} className="inline-flex">{icon}</span>;
}

/** Icon for a context chip, by the kind of link it is. */
export function ChipIcon({ kind, className = "h-3.5 w-3.5" }: { kind: ChipKind; className?: string }) {
  const props = { className, strokeWidth: 1.5 };
  const names: Record<ChipKind, string> = { slack: "Slack channel", doc: "Google Doc", sheet: "Google Sheet", slide: "Google Slides", jira: "Jira ticket", email: "Email thread", link: "Link" };
  const icon =
    kind === "slack" ? <Hash {...props} /> : kind === "doc" ? <FileText {...props} /> : kind === "sheet" ? <Table {...props} /> : kind === "slide" ? <Presentation {...props} /> : kind === "jira" ? <Ticket {...props} /> : kind === "email" ? <Mail {...props} /> : <LinkIcon {...props} />;
  return <span title={names[kind]} className="inline-flex">{icon}</span>;
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
    <span
      title={reason}
      className={`inline-flex items-center gap-1.5 text-xs ${urgencyColor[urgency]}`}
    >
      <CircleDot className="h-3.5 w-3.5" strokeWidth={2} />
      {withLabel ? <span>{urgency}</span> : <span className="sr-only">{urgency}</span>}
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
