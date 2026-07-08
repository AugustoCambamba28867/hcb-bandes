import { DEFAULT_ROLE_PERMISSIONS, ROLES, type PermissionModule, type Role } from "@/lib/mock-data";

const DEFAULT_ROLE: Role = "Administrator";

export function getAdminRole(role?: string | null): Role {
  if (role && ROLES.includes(role as Role)) {
    return role as Role;
  }
  return DEFAULT_ROLE;
}

export function canAccessAdminModule(
  role: string | null | undefined,
  module: PermissionModule | string,
  action: string,
): boolean {
  const resolvedRole = getAdminRole(role);
  const permissions = DEFAULT_ROLE_PERMISSIONS[resolvedRole] ?? {};
  const actions = permissions[module as PermissionModule] ?? [];
  return actions.includes(action);
}

export function getAdminAccessMessage(
  role: string | null | undefined,
  module: PermissionModule | string,
  action = "View",
) {
  const resolvedRole = getAdminRole(role);
  return `O papel ${resolvedRole} não tem permissão para ${action.toLowerCase()} ${module}.`;
}
