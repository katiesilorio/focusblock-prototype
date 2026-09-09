import { FileText, Hash, Mail, SquareKanban, CircleDot } from "lucide-react";
import type { Tool, Urgency } from "@/data/focusblock";

export function ToolIcon({ tool, className = "h-4 w-4" }: { tool: Tool; className?: string }) {
  const props = { className: `${className} text-muted-foreground`, strokeWidth: 1.5 };
  if (tool === "Slack") return <Hash {...props} />;
  if (tool === "Gmail") return <Mail {...props} />;
  if (tool === "Jira") return <SquareKanban {...props} />;
  return <FileText {...props} />;
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
