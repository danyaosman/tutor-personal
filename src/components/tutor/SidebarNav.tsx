import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Bot,
  BookOpen,
  FolderOpen,
  Target,
  HelpCircle,
  ClipboardList,
  BarChart3,
  AlertTriangle,
  Inbox,
  Settings,
  Sparkles,
  LogOut,
} from "lucide-react";
import { clearSession } from "@/lib/api";
import { currentUserQueryKey, useCurrentUser } from "@/hooks/use-current-user";
import { useQueryClient } from "@tanstack/react-query";

const nav = [
  { to: "/tutor/overview", label: "Overview", icon: LayoutDashboard },
  { to: "/tutor/digital-twin", label: "Digital Twin", icon: Bot },
  { to: "/tutor/courses", label: "Courses", icon: BookOpen },
  { to: "/tutor/resources", label: "Resources", icon: FolderOpen },
  { to: "/tutor/syllabus", label: "Syllabus & Goals", icon: Target },
  { to: "/tutor/quizzes", label: "Quizzes", icon: HelpCircle },
  { to: "/tutor/assignments", label: "Assignments", icon: ClipboardList },
  { to: "/tutor/analytics", label: "Student Analytics", icon: BarChart3 },
  { to: "/tutor/weakness-analysis", label: "Weakness Analysis", icon: AlertTriangle },
  { to: "/tutor/requests", label: "Requests", icon: Inbox },
  { to: "/tutor/settings", label: "Settings", icon: Settings },
] as const;

export function SidebarNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const name = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.username || "Tutor";
  const initials = name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 z-30 w-[260px] flex-col border-r border-sidebar-border gradient-sidebar">
      <div className="flex h-16 items-center gap-2 px-5 border-b border-sidebar-border">
        <div className="grid h-9 w-9 place-items-center rounded-xl gradient-ai shadow-glow">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-extrabold tracking-tight">AI Tutor</div>
          <div className="text-[11px] text-muted-foreground">Teach with your twin</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {nav.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
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
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full gradient-ai text-xs font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{name}</div>
            <div className="truncate text-[11px] text-muted-foreground">{user?.email || "Tutor workspace"}</div>
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
