import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Role, Permission } from "@/lib/types";

interface RoleWithCount extends Role {
  userCount: number;
}

// ─── Query keys ──────────────────────────────────────────────
export const roleKeys = {
  all: ["roles"] as const,
  detail: (id: string) => ["roles", id] as const,
};

// ─── Fetch all roles ─────────────────────────────────────────
export function useRoles() {
  return useQuery<RoleWithCount[]>({
    queryKey: roleKeys.all,
    queryFn: async () => {
      const res = await fetch("/api/roles");
      if (!res.ok) throw new Error("Failed to fetch roles");
      const data = await res.json();
      return data.data;
    },
  });
}

// ─── Fetch single role ───────────────────────────────────────
export function useRole(id: string) {
  return useQuery<RoleWithCount>({
    queryKey: roleKeys.detail(id),
    queryFn: async () => {
      const res = await fetch(`/api/roles/${id}`);
      if (!res.ok) throw new Error("Role not found");
      const data = await res.json();
      return data.data;
    },
    enabled: !!id,
  });
}

// ─── Create role ─────────────────────────────────────────────
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: { name: string; description: string; permissions: Permission[] }) => {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to create role");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
}

// ─── Update role ─────────────────────────────────────────────
export function useUpdateRole(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: { name?: string; description?: string; permissions?: Permission[] }) => {
      const res = await fetch(`/api/roles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update role");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) });
    },
  });
}

// ─── Delete role ─────────────────────────────────────────────
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/roles/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete role");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
}

// ─── Duplicate role ──────────────────────────────────────────
export function useDuplicateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (role: Role) => {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${role.name} (Copy)`,
          description: role.description,
          permissions: role.permissions,
        }),
      });
      if (!res.ok) throw new Error("Failed to duplicate role");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
}
