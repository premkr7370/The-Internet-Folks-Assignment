// ─── Resources ───────────────────────────────────────────────
export const RESOURCES = ['projects', 'tasks', 'members', 'billing', 'settings'] as const;
export type Resource = (typeof RESOURCES)[number];

// ─── Actions per resource ────────────────────────────────────
export const RESOURCE_ACTIONS: Record<Resource, readonly string[]> = {
  projects: ['view', 'create', 'edit', 'delete', 'archive'] as const,
  tasks: ['view', 'create', 'edit', 'delete', 'assign'] as const,
  members: ['view', 'invite', 'remove', 'update_role'] as const,
  billing: ['view', 'update', 'download_invoices'] as const,
  settings: ['view', 'update'] as const,
};

export type ProjectAction = 'view' | 'create' | 'edit' | 'delete' | 'archive';
export type TaskAction = 'view' | 'create' | 'edit' | 'delete' | 'assign';
export type MemberAction = 'view' | 'invite' | 'remove' | 'update_role';
export type BillingAction = 'view' | 'update' | 'download_invoices';
export type SettingsAction = 'view' | 'update';

export type Action = ProjectAction | TaskAction | MemberAction | BillingAction | SettingsAction;

// ─── Permission string ──────────────────────────────────────
export type Permission = `${Resource}.${string}`;

// ─── Role ────────────────────────────────────────────────────
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── User ────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  roleIds: string[];
  status: 'active' | 'inactive';
  createdAt: string;
}

// ─── API response wrappers ──────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PermissionGroup {
  resource: Resource;
  actions: string[];
}

// ─── Effective permissions result ───────────────────────────
export interface EffectivePermissions {
  userId: string;
  roles: Role[];
  permissions: Permission[];
  permissionsByResource: Record<Resource, string[]>;
}
