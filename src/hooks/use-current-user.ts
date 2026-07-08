import { useQuery } from "@tanstack/react-query";
import { getCurrentUser, hasSession } from "@/lib/api";

export const currentUserQueryKey = ["auth", "current-user"] as const;

export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: getCurrentUser,
    enabled: typeof window !== "undefined" && hasSession(),
    retry: false,
    staleTime: 60_000,
  });
}
