import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  BookOpen,
  Bot,
  MessagesSquare,
  ClipboardList,
  HelpCircle,
  LineChart,
  AlertTriangle,
  Library,
  Send,
  Settings,
  GraduationCap,
  LogOut,
} from "lucide-react";
import { learnerProfile } from "@/data/mockData";

const nav = [
  { to: "/learner", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/learner/courses", label: "My Courses", icon: BookOpen },
  { to: "/learner/tutors", label: "AI Tutors", icon: Bot },
  { to: "/learner/sessions", label: "Sessions", icon: MessagesSquare },
  { to: "/learner/assignments", label: "Assignments", icon: ClipboardList },
  { to: "/learner/quizzes", label: "Quizzes", icon: HelpCircle },
  { to: "/learner/progress", label: "My Progress", icon: LineChart },
  { to: "/learner/weaknesses", label: "Weak Spots", icon: AlertTriangle },
  { to: "/learner/resources", label: "Library", icon: Library },
  { to: "/learner/ask", label: "Ask a Tutor", icon: Send },
  { to: "/learner/settings", label: "Settings", icon: Settings },
] as const;

export function LearnerSidebarNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 z-30 w-[260px] flex-col border-r border-sidebar-border gradient-sidebar">
      <div className="flex h-16 items-center gap-2 px-5 border-b border-sidebar-border">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-glow">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-extrabold tracking-tight">AI Tutor</div>
          <div className="text-[11px] text-muted-foreground">Learn with your twin</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
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
              <Icon className={["h-4 w-4 shrink-0", active ? "text-primary" : "opacity-70 group-hover:opacity-100"].join(" ")} />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg p-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-bold text-white">
            {learnerProfile.avatarInitials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{learnerProfile.name}</div>
            <div className="truncate text-[11px] text-muted-foreground">Lvl {learnerProfile.level} · {learnerProfile.xp} XP</div>
          </div>
          <Link
            to="/login"
            aria-label="Log out"
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            // TODO: connect to real auth signout
          >
            <LogOut className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
