import type { Role, User, Permission, Resource, EffectivePermissions } from '@/lib/types';
import { RESOURCES, RESOURCE_ACTIONS } from '@/lib/types';
import { seedRoles, seedUsers } from './seed';

/**
 * In-memory data store for the RBAC system.
 *
 * This module acts as our "database" — all data lives in memory and resets
 * on server restart. Each exported function is a self-contained operation
 * that can be called from API route handlers.
 */

// ─── State ───────────────────────────────────────────────────
let roles: Role[] = [...seedRoles];
let users: User[] = [...seedUsers];

// ─── Helpers ─────────────────────────────────────────────────
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Role operations ────────────────────────────────────────

export function getRoles(): Role[] {
  return [...roles];
}

export function getRoleById(id: string): Role | undefined {
  return roles.find((r) => r.id === id);
}

export function createRole(data: { name: string; description: string; permissions: Permission[] }): Role {
  const now = new Date().toISOString();
  const role: Role = {
    id: generateId('role'),
    name: data.name,
    description: data.description,
    permissions: [...data.permissions],
    isSystem: false,
    createdAt: now,
    updatedAt: now,
  };
  roles.push(role);
  return role;
}

export function updateRole(
  id: string,
  data: { name?: string; description?: string; permissions?: Permission[] }
): Role | null {
  const index = roles.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const role = roles[index];
  roles[index] = {
    ...role,
    name: data.name ?? role.name,
    description: data.description ?? role.description,
    permissions: data.permissions ?? role.permissions,
    updatedAt: new Date().toISOString(),
  };
  return roles[index];
}

export function deleteRole(id: string): boolean {
  const index = roles.findIndex((r) => r.id === id);
  if (index === -1) return false;

  roles.splice(index, 1);

  // Remove from all users who had this role
  users = users.map((u) => ({
    ...u,
    roleIds: u.roleIds.filter((rid) => rid !== id),
  }));

  return true;
}

export function getUserCountForRole(roleId: string): number {
  return users.filter((u) => u.roleIds.includes(roleId)).length;
}

// ─── User operations ────────────────────────────────────────

export function getUsers(): User[] {
  return [...users];
}

export function getUserById(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

export function assignRoleToUser(userId: string, roleId: string): User | null {
  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) return null;

  const role = getRoleById(roleId);
  if (!role) return null;

  if (!users[userIndex].roleIds.includes(roleId)) {
    users[userIndex] = {
      ...users[userIndex],
      roleIds: [...users[userIndex].roleIds, roleId],
    };
  }

  return users[userIndex];
}

export function removeRoleFromUser(userId: string, roleId: string): User | null {
  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) return null;

  users[userIndex] = {
    ...users[userIndex],
    roleIds: users[userIndex].roleIds.filter((rid) => rid !== roleId),
  };

  return users[userIndex];
}

// ─── Permission Resolution (UNION strategy) ─────────────────
/**
 * Computes the effective permissions for a user using a UNION strategy.
 *
 * UNION was chosen because:
 * 1. Principle of least surprise — adding a role never removes access
 * 2. Additive model — matches industry standard (AWS IAM, GCP IAM)
 * 3. Simplicity — no deny/override rules to manage
 * 4. Auditability — easy to trace which role grants a permission
 */
export function computeEffectivePermissions(userId: string): EffectivePermissions | null {
  const user = getUserById(userId);
  if (!user) return null;

  const userRoles = user.roleIds
    .map((rid) => getRoleById(rid))
    .filter((r): r is Role => r !== undefined);

  // UNION: merge all permissions, deduplicate
  const permissionSet = new Set<Permission>();
  for (const role of userRoles) {
    for (const perm of role.permissions) {
      permissionSet.add(perm);
    }
  }

  const permissions = Array.from(permissionSet).sort();

  // Group by resource
  const permissionsByResource: Record<Resource, string[]> = {
    projects: [],
    tasks: [],
    members: [],
    billing: [],
    settings: [],
  };

  for (const perm of permissions) {
    const [resource, action] = perm.split('.') as [Resource, string];
    if (RESOURCES.includes(resource) && RESOURCE_ACTIONS[resource].includes(action)) {
      permissionsByResource[resource].push(action);
    }
  }

  return {
    userId,
    roles: userRoles,
    permissions,
    permissionsByResource,
  };
}
