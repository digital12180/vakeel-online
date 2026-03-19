
// app/constants/roles.ts
export const ROLES = {
  admin: 'admin',
  user: 'user',
  professional: 'professional',
} as const;

export const ROLE_MAP = {
  [ROLES.admin]: 1,
  [ROLES.user]: 2,
  [ROLES.professional]: 3,
};

export const ROLE_REVERSE_MAP = {
  1: ROLES.admin,
  2: ROLES.user,
  3: ROLES.professional
};

export type UserRole = typeof ROLES[keyof typeof ROLES];