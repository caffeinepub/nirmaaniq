import { StandardizedRole } from '../backend';

export const ROLE_LABELS: Record<StandardizedRole, string> = {
  [StandardizedRole.admin]: 'Admin',
  [StandardizedRole.site_engineer]: 'Site Engineer',
  [StandardizedRole.project_manager]: 'Project Manager',
};

export function getRoleLabel(role: StandardizedRole): string {
  return ROLE_LABELS[role] || role;
}

export function normalizeRole(role: string): StandardizedRole {
  const normalized = role.toLowerCase().replace(/\s+/g, '_');
  
  switch (normalized) {
    case 'admin':
      return StandardizedRole.admin;
    case 'site_engineer':
    case 'site engineer':
      return StandardizedRole.site_engineer;
    case 'project_manager':
    case 'project manager':
      return StandardizedRole.project_manager;
    default:
      return StandardizedRole.site_engineer;
  }
}

export function isAdmin(role: StandardizedRole): boolean {
  return role === StandardizedRole.admin;
}

export function isSiteEngineer(role: StandardizedRole): boolean {
  return role === StandardizedRole.site_engineer;
}

export function isProjectManager(role: StandardizedRole): boolean {
  return role === StandardizedRole.project_manager;
}
