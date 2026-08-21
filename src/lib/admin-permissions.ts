import { DEFAULT_ROLE_PERMISSIONS, ROLES, type PermissionModule, type Role } from "@/lib/mock-data";
import { isSupabaseConfigured } from "@/lib/supabase-client";
import {
  listRolePermissionsFromSupabase,
  saveRolePermissionsToSupabase,
  saveAllRolePermissionsToSupabase,
} from "@/lib/supabase-data";

const DEFAULT_ROLE: Role = "Administrator";
const PERMISSIONS_KEY = "hcb_role_permissions_v2";

export function getAdminRole(role?: string | null): Role {
  if (role && ROLES.includes(role as Role)) {
    return role as Role;
  }
  return DEFAULT_ROLE;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getStoredPermissions(): Record<string, Partial<Record<PermissionModule, string[]>>> {
  if (!isBrowser()) return { ...DEFAULT_ROLE_PERMISSIONS };
  try {
    const raw = window.localStorage.getItem(PERMISSIONS_KEY);
    if (!raw) return { ...DEFAULT_ROLE_PERMISSIONS };
    return { ...DEFAULT_ROLE_PERMISSIONS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_ROLE_PERMISSIONS };
  }
}

export function writeStoredPermissions(matrix: Record<string, Partial<Record<PermissionModule, string[]>>>) {
  if (!isBrowser()) return;
  window.localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(matrix));
  window.dispatchEvent(new Event("hcb_permissions_changed"));
}

export async function fetchPermissionsFromSupabase(): Promise<Record<string, Partial<Record<PermissionModule, string[]>>>> {
  if (await isSupabaseConfigured()) {
    try {
      const remote = await listRolePermissionsFromSupabase();
      if (remote && Object.keys(remote).length > 0) {
        const merged = { ...DEFAULT_ROLE_PERMISSIONS, ...remote };
        writeStoredPermissions(merged);
        return merged;
      }
    } catch (err) {
      console.warn("Failed to fetch role permissions from Supabase", err);
    }
  }
  return getStoredPermissions();
}

export async function savePermissionsToSupabaseDirect(
  matrix: Record<string, Partial<Record<PermissionModule, string[]>>>
): Promise<boolean> {
  writeStoredPermissions(matrix);
  if (await isSupabaseConfigured()) {
    try {
      return await saveAllRolePermissionsToSupabase(matrix);
    } catch (err) {
      console.warn("Failed to save role permissions to Supabase", err);
      return false;
    }
  }
  return true;
}

export function canAccessAdminModule(
  role: string | null | undefined,
  module: PermissionModule | string,
  action: string,
): boolean {
  const resolvedRole = getAdminRole(role);
  const matrix = getStoredPermissions();
  const permissions = matrix[resolvedRole] ?? DEFAULT_ROLE_PERMISSIONS[resolvedRole] ?? {};
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

