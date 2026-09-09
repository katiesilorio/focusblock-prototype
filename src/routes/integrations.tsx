import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/state/app-state";
import { ToolIcon } from "@/components/bits";

export const Route = createFileRoute("/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations, FocusBlock prototype" },
      {
        name: "description",
        content:
          "FocusBlock sits on top of Slack, Gmail, Jira, and Google Drive. Connections here are simulated.",
      },
      { property: "og:title", content: "Integrations, FocusBlock prototype" },
      {
        property: "og:description",
        content:
          "FocusBlock sits on top of Slack, Gmail, Jira, and Google Drive. Connections here are simulated.",
      },
    ],
  }),
  component: IntegrationsPage,
});

function IntegrationsPage() {
  const app = useApp();
  const [pending, setPending] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <h1 className="text-xl font-medium tracking-tight">Integrations</h1>

      <div className="mt-6 space-y-3">
        {app.integrations.map((i) => (
          <div key={i.id} className="card-soft flex items-center gap-4 p-5">
            <ToolIcon tool={i.name} className="h-5 w-5" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{i.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{i.reads}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              {i.connected ? "Connected" : "Not connected"}
            </p>
            <button
              type="button"
              disabled={pending === i.id}
              className={`btn-base ${i.connected ? "btn-quiet" : "btn-primary"}`}
              onClick={() => {
                setPending(i.id);
                setTimeout(() => {
                  app.toggleIntegration(i.id);
                  setPending(null);
                }, 700);
              }}
            >
              {pending === i.id ? "Working" : i.connected ? "Disconnect" : "Connect"}
            </button>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Connections are simulated in this prototype. Nothing is read from a real account.
      </p>
    </div>
  );
}
