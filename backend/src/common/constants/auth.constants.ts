export enum ActorType {
  CITIZEN = 'citizen',
  ADMIN = 'admin',
}

export const SYSTEM_ROLE_KEYS = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  OPERATOR: 'OPERATOR',
  SUPPORT: 'SUPPORT',
  FINANCE: 'FINANCE',
} as const;

export type SystemRoleKey =
  (typeof SYSTEM_ROLE_KEYS)[keyof typeof SYSTEM_ROLE_KEYS];
