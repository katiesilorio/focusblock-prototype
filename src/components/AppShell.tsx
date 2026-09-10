import { Link } from "@tanstack/react-router";
import { CircleHelp } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

const nav = [
  { to: "/", label: "Focus" },
  { to: "/blocks", label: "Blocks" },
  { to: "/integrations", label: "Integrations" },
  { to: "/writing-style", label: "Writing style" },
  { to: "/about", label: "About" },
] as const;

function useIsNarrow() {
  const [narrow, setNarrow] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const check = () => setNarrow(window.innerWidth < 1000);
    check();
    setReady(true);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return { narrow, ready };
}

export function AppShell({ children }: { children: ReactNode }) {
  const { narrow, ready } = useIsNarrow();

  if (ready && narrow) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="card-soft max-w-sm p-8 text-center">
          <p className="text-base font-medium">FocusBlock is optimized for desktop</p>
          <p className="mt-2 text-sm text-muted-foreground">Mobile is coming soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="sticky top-0 z-30 bg-surface">
      <div className="border-b border-border bg-muted px-6 py-2 text-center text-xs text-muted-foreground">
        Prototype. Everything here is simulated: the team, the messages, the tickets, and the AI.
        Optimized for desktop, mobile coming soon.{" "}
        <Link to="/about" className="underline underline-offset-2 hover:text-foreground">
          About FocusBlock
        </Link>
      </div>

      <header className="flex items-center justify-between border-b border-border bg-surface px-8 py-3">
        <Link to="/" className="text-[15px] font-semibold tracking-tight">
          FocusBlock
        </Link>
        <nav className="flex items-center gap-1">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              data-tour={
                item.label === "Integrations"
                  ? "nav-integrations"
                  : item.label === "Writing style"
                    ? "nav-writing-style"
                    : undefined
              }
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground data-[status=active]:bg-muted data-[status=active]:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => {
              window.localStorage.removeItem("focusblock-tour-seen");
              window.location.href = "/";
            }}
            className="ml-2 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <CircleHelp className="h-4 w-4" strokeWidth={1.5} />
            Take the tour
          </button>
        </nav>
      </header>
      </div>

      <main className="flex-1">{children}</main>

      <footer className="flex items-center justify-between border-t border-border px-8 py-3 text-xs text-muted-foreground">
        <span>FocusBlock prototype. Nothing here is real.</span>
        <span className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              window.localStorage.removeItem("focusblock-tour-seen");
              window.location.href = "/";
            }}
            className="hover:text-foreground"
          >
            Take the tour again
          </button>
          <Link to="/about" className="hover:text-foreground">
            About FocusBlock
          </Link>
        </span>
      </footer>
    </div>
  );
}
