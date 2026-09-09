import { FileText, Hash, Mail, SquareKanban, CircleDot, Table, Presentation, Link as LinkIcon } from "lucide-react";
import type { ChipKind, Tool, Urgency } from "@/data/focusblock";

export function ToolIcon({ tool, className = "h-4 w-4" }: { tool: Tool; className?: string }) {
  const props = { className: `${className} text-muted-foreground`, strokeWidth: 1.5 };
  if (tool === "Slack") return <Hash {...props} />;
  if (tool === "Gmail") return <Mail {...props} />;
  if (tool === "Jira") return <SquareKanban {...props} />;
  return <FileText {...props} />;
}

/** Icon for a context chip, by the kind of link it is. */
export function ChipIcon({ kind, className = "h-3.5 w-3.5" }: { kind: ChipKind; className?: string }) {
  const props = { className, strokeWidth: 1.5 };
  if (kind === "slack") return <Hash {...props} />;
  if (kind === "doc") return <FileText {...props} />;
  if (kind === "sheet") return <Table {...props} />;
  if (kind === "slide") return <Presentation {...props} />;
  if (kind === "jira") return <SquareKanban {...props} />;
  if (kind === "email") return <Mail {...props} />;
  return <LinkIcon {...props} />;
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
