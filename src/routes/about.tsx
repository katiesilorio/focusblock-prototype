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
        tickets, and document comments a person already gets, groups them into the projects that
        person is working on (Blocks), decides which ones need their attention, and gives them a
        timed session to work through those. The belief behind it: a work tool should be as easy to
        use as the apps people use every day. No tutorial needed and what you have to do just makes
        sense.
      </Section>

      <Section title="What this prototype shows">
        <ul className="list-disc space-y-1 pl-5">
          <li>Blocks, and the context that flows into each one</li>
          <li>The AI's urgency call on every cue, with the reason on hover</li>
          <li>Timed FocusBlock sessions with an AI summary of what is going on</li>
          <li>Acting on a cue from the right panel, with an AI-drafted reply or comment</li>
          <li>What you got done, shown when the session ends</li>
          <li>Block configuration, including a Block the AI suggests from unassigned context</li>
          <li>An Integrations screen for Slack, Gmail, Jira, and Google Drive</li>
          <li>A Writing style page, where examples of how you write become a style guide that Draft with AI follows</li>
        </ul>
      </Section>

      <Section title="What is simulated">
        All of it. Every integration, every AI summary, draft, and urgency call, and every message
        and ticket. The company, the people, and the content are invented.
      </Section>

      <Section title="What is out">
        <ul className="list-disc space-y-1 pl-5">
          <li>Real connections to Slack, Gmail, Jira, or Google Drive</li>
          <li>Real AI calls</li>
          <li>Saving anything between visits, beyond remembering the tour</li>
          <li>Mobile. Optimized for desktop, mobile coming soon.</li>
        </ul>
      </Section>

      <Section title="Status">
        Build in progress. This prototype is the interface, built to work out what a person should
        see and control at each step. The working version is being built separately.
      </Section>

      <Section title="What is next">
        Connect a real Slack workspace and a real Jira project as the first live integrations, then
        replace the scripted summaries and drafts with live AI calls.
      </Section>

      <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
        A prototype built by Katie Silorio to test a direction. No real users, no real data, no real
        messages sent.
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
