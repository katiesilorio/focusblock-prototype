import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About FocusBlock, prototype" },
      {
        name: "description",
        content:
          "What the FocusBlock prototype is, what it shows, what is simulated, and what comes next.",
      },
      { property: "og:title", content: "About FocusBlock, prototype" },
      {
        property: "og:description",
        content:
          "What the FocusBlock prototype is, what it shows, what is simulated, and what comes next.",
      },
    ],
  }),
  component: AboutPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-sm font-medium">{title}</h2>
      <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-8 py-12">
      <h1 className="text-xl font-medium tracking-tight">About FocusBlock</h1>

      <Section title="What FocusBlock is">
        An AI attention layer for teams that work asynchronously. It reads the messages, emails,
        tickets, and document comments a person already receives, groups them into the projects the
        person is working on, decides which ones actually need their attention, and lets them work
        through those in timed sessions.
      </Section>

      <Section title="What this prototype shows">
        Blocks and their context, the AI's urgency read on every cue with its reason, timed
        FocusBlock sessions with an AI summary, acting on a cue with an AI-drafted reply or comment,
        the session-end accomplishments, block configuration with AI-suggested Blocks, and an
        integrations screen.
      </Section>

      <Section title="What is simulated">
        Every integration, every AI summary, draft, and urgency call, every message and ticket. The
        company, people, and content are invented.
      </Section>

      <Section title="What is out">
        Real connections to Slack, Gmail, Jira, or Google Drive. Real AI. Saving anything between
        visits beyond remembering the tour. Mobile: optimized for desktop, mobile coming soon.
      </Section>

      <Section title="Status">Build in progress. This prototype is the interface; the connected, working version is being built separately.</Section>

      <Section title="What is next">
        Connecting a real Slack workspace and Jira project as the first live integrations, and
        replacing the scripted summaries and drafts with live AI calls.
      </Section>

      <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
        This is a prototype built by Katie Silorio to test a direction. There are no real users and
        no real data.
      </p>

      <button
        type="button"
        className="btn-base btn-quiet mt-6"
        onClick={() => {
          window.localStorage.removeItem("focusblock-tour-seen");
          window.location.href = "/";
        }}
      >
        Take the tour again
      </button>
    </div>
  );
}
