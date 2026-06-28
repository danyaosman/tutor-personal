import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireRouteRole } from "@/lib/routeGuards";

export const Route = createFileRoute("/tutor")({
  beforeLoad: ({ context }) => requireRouteRole(context.queryClient, "teacher"),
  component: () => <Outlet />,
});
