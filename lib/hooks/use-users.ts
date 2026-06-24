import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Role, EffectivePermissions } from "@/lib/types";
import { roleKeys } from "./use-roles";

interface UserWithRoles {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: string;
  roleIds: string[];
  roles: { id: string; name: string }[];
  createdAt: string;
}

interface UserDetail {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: string;
  roleIds: string[];
  roles: Role[];
  createdAt: string;
}

// ─── Query keys ──────────────────────────────────────────────
export const userKeys = {
  all: ["users"] as const,
  detail: (id: string) => ["users", id] as const,
  effectivePermissions: (id: string) => ["users", id, "effective-permissions"] as const,
};

// ─── Fetch all users ─────────────────────────────────────────
export function useUsers() {
  return useQuery<UserWithRoles[]>({
    queryKey: userKeys.all,
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      return data.data;
    },
  });
}

// ─── Fetch single user ──────────────────────────────────────
export function useUser(id: string) {
  return useQuery<UserDetail>({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const res = await fetch(`/api/users/${id}`);
      if (!res.ok) throw new Error("User not found");
      const data = await res.json();
      return data.data;
    },
    enabled: !!id,
  });
}

// ─── Fetch effective permissions ─────────────────────────────
export function useEffectivePermissions(id: string) {
  return useQuery<EffectivePermissions>({
    queryKey: userKeys.effectivePermissions(id),
    queryFn: async () => {
      const res = await fetch(`/api/users/${id}/effective-permissions`);
      if (!res.ok) throw new Error("Failed to fetch effective permissions");
      const data = await res.json();
      return data.data;
    },
    enabled: !!id,
  });
}

// ─── Assign role to user ────────────────────────────────────
export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      const res = await fetch(`/api/users/${userId}/roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId }),
      });
      if (!res.ok) throw new Error("Failed to assign role");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.effectivePermissions(variables.userId) });
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
}

// ─── Remove role from user ──────────────────────────────────
export function useRemoveRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      const res = await fetch(`/api/users/${userId}/roles/${roleId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove role");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.effectivePermissions(variables.userId) });
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
}
