import { useQuery } from "@tanstack/react-query";
import type { PermissionGroup } from "@/lib/types";

export const permissionKeys = {
  all: ["permissions"] as const,
};

export function usePermissions() {
  return useQuery<PermissionGroup[]>({
    queryKey: permissionKeys.all,
    queryFn: async () => {
      const res = await fetch("/api/permissions");
      if (!res.ok) throw new Error("Failed to fetch permissions");
      const data = await res.json();
      return data.data;
    },
  });
}
