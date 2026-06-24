import type { Role, User, Permission } from '@/lib/types';

// ─── Seed Roles ──────────────────────────────────────────────

export const seedRoles: Role[] = [
  {
    id: 'role-owner',
    name: 'Owner',
    description: 'Full access to all resources. Intended for workspace creators and primary administrators.',
    permissions: [
      'projects.view', 'projects.create', 'projects.edit', 'projects.delete', 'projects.archive',
      'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete', 'tasks.assign',
      'members.view', 'members.invite', 'members.remove', 'members.update_role',
      'billing.view', 'billing.update', 'billing.download_invoices',
      'settings.view', 'settings.update',
    ] as Permission[],
    isSystem: true,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'role-admin',
    name: 'Admin',
    description: 'Can manage projects, tasks, and members. Cannot modify billing or workspace settings.',
    permissions: [
      'projects.view', 'projects.create', 'projects.edit', 'projects.delete',
      'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete', 'tasks.assign',
      'members.view', 'members.invite', 'members.remove', 'members.update_role',
      'settings.view',
    ] as Permission[],
    isSystem: true,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'role-member',
    name: 'Member',
    description: 'Can work on projects and tasks. Can view members but cannot invite or remove them.',
    permissions: [
      'projects.view', 'projects.create', 'projects.edit',
      'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.assign',
      'members.view',
      'settings.view',
    ] as Permission[],
    isSystem: true,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'role-viewer',
    name: 'Viewer',
    description: 'Read-only access across projects, tasks, and members. Ideal for stakeholders and observers.',
    permissions: [
      'projects.view',
      'tasks.view',
      'members.view',
      'billing.view',
      'settings.view',
    ] as Permission[],
    isSystem: true,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'role-contractor',
    name: 'Contractor',
    description: 'Can view and edit assigned projects and tasks. No access to members, billing, or settings.',
    permissions: [
      'projects.view', 'projects.edit',
      'tasks.view', 'tasks.create', 'tasks.edit',
    ] as Permission[],
    isSystem: false,
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z',
  },
];

// ─── Seed Users ──────────────────────────────────────────────

export const seedUsers: User[] = [
  {
    id: 'user-sarah',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@workbench.io',
    avatar: 'SJ',
    roleIds: ['role-admin', 'role-viewer'],
    status: 'active',
    createdAt: '2024-01-20T09:00:00Z',
  },
  {
    id: 'user-john',
    name: 'John Smith',
    email: 'john.smith@workbench.io',
    avatar: 'JS',
    roleIds: ['role-contractor'],
    status: 'active',
    createdAt: '2024-02-05T11:00:00Z',
  },
  {
    id: 'user-emma',
    name: 'Emma Wilson',
    email: 'emma.wilson@workbench.io',
    avatar: 'EW',
    roleIds: ['role-owner'],
    status: 'active',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'user-alex',
    name: 'Alex Brown',
    email: 'alex.brown@workbench.io',
    avatar: 'AB',
    roleIds: ['role-member', 'role-contractor'],
    status: 'active',
    createdAt: '2024-03-01T14:00:00Z',
  },
];
