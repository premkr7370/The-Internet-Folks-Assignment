import { RESOURCES, RESOURCE_ACTIONS, type Permission, type PermissionGroup } from '@/lib/types';

/**
 * All permissions in the system, derived from the RESOURCE_ACTIONS matrix.
 * This is the single source of truth — do not add or remove permissions elsewhere.
 */
export const ALL_PERMISSIONS: Permission[] = RESOURCES.flatMap((resource) =>
  RESOURCE_ACTIONS[resource].map((action) => `${resource}.${action}` as Permission)
);

/**
 * Permissions grouped by resource for UI display.
 */
export const PERMISSION_GROUPS: PermissionGroup[] = RESOURCES.map((resource) => ({
  resource,
  actions: [...RESOURCE_ACTIONS[resource]],
}));

/**
 * Resource display labels.
 */
export const RESOURCE_LABELS: Record<string, string> = {
  projects: 'Projects',
  tasks: 'Tasks',
  members: 'Members',
  billing: 'Billing',
  settings: 'Settings',
};

/**
 * Action display labels.
 */
export const ACTION_LABELS: Record<string, string> = {
  view: 'View',
  create: 'Create',
  edit: 'Edit',
  delete: 'Delete',
  archive: 'Archive',
  assign: 'Assign',
  invite: 'Invite',
  remove: 'Remove',
  update_role: 'Update Role',
  update: 'Update',
  download_invoices: 'Download Invoices',
};
