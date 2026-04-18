export const ROLES = ['admin', 'user'] as const;
export type Role = typeof ROLES[number];

export const ROLE_ROUTES: Record<Role, string> = {
  admin: '/admin',
  user: '/dashboard',
};

export const DEFAULT_ROLE: Role = 'user';
