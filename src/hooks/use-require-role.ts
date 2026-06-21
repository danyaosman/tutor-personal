import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ApiError, clearSession, getRoleHome, hasSession, type UserRole } from "@/lib/api";
import { useCurrentUser } from "@/hooks/use-current-user";

export function useRequireRole(role: UserRole) {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();

  useEffect(() => {
    if (!hasSession()) {
      void navigate({ to: "/login", replace: true });
      return;
    }
    if (currentUser.error instanceof ApiError && currentUser.error.status === 401) {
      clearSession();
      void navigate({ to: "/login", replace: true });
      return;
    }
    if (currentUser.data && currentUser.data.role !== role) {
      void navigate({ to: getRoleHome(currentUser.data.role), replace: true });
    }
  }, [currentUser.data, currentUser.error, navigate, role]);

  return {
    ...currentUser,
    isAuthorized: currentUser.data?.role === role,
  };
}
