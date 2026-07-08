import type { QueryClient } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { currentUserQueryKey } from "@/hooks/use-current-user";
import {
  ApiError,
  clearSession,
  getCurrentUser,
  getRoleHome,
  hasSession,
  type UserRole,
} from "@/lib/api";

export async function requireRouteRole(queryClient: QueryClient, role: UserRole) {
  if (typeof window === "undefined") return;

  if (!hasSession()) {
    throw redirect({ to: "/login", replace: true });
  }

  try {
    const user = await queryClient.ensureQueryData({
      queryKey: currentUserQueryKey,
      queryFn: getCurrentUser,
      staleTime: 60_000,
    });

    if (user.role !== role) {
      throw redirect({ to: getRoleHome(user.role), replace: true });
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clearSession();
      throw redirect({ to: "/login", replace: true });
    }
    throw error;
  }
}
