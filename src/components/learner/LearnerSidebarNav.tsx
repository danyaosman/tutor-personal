import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  GraduationCap,
  HelpCircle,
  Layers,
  LogOut,
  Settings,
} from "lucide-react";
import { currentUserQueryKey, useCurrentUser } from "@/hooks/use-current-user";
import { clearSession } from "@/lib/api";

type NavItem = { to: string; label: string; icon: typeof BookOpen; exact?: boolean };

const nav: NavItem[] = [
  { to: "/learner/courses", label: "My Courses", icon: BookOpen },
  { to: "/learner/progress", label: "Progress", icon: BarChart3 },
  { to: "/learner/quizzes", label: "Quizzes", icon: HelpCircle },
  { to: "/learner/flashcards", label: "Flashcards", icon: Layers },
  { to: "/learner/settings", label: "Settings", icon: Settings },
];

export function LearnerSidebarNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const name =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.username ||
    "Learner";
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col border-r border-sidebar-border gradient-sidebar md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-glow">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-extrabold tracking-tight">AI Tutor</div>
          <div className="text-[11px] text-muted-foreground">Learner workspace</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {nav.map(({ to, label, icon: Icon, exact }) => {
          const active = exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to}
              className={[
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              ].join(" ")}
            >
              <Icon
                className={[
                  "h-4 w-4 shrink-0",
                  active ? "text-primary" : "opacity-70 group-hover:opacity-100",
                ].join(" ")}
              />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg p-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{name}</div>
            <div className="truncate text-[11px] text-muted-foreground">
              {user?.email || "Learner workspace"}
            </div>
          </div>
          <Link
            to="/login"
            aria-label="Log out"
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            onClick={() => {
              clearSession();
              queryClient.removeQueries({ queryKey: currentUserQueryKey });
            }}
          >
            <LogOut className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
