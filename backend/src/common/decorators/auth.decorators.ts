import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { Request } from 'express';

import { PermissionKey } from '../constants/permissions.constants';

export const PERMISSIONS_KEY = 'permissions';
export const ANY_PERMISSIONS_KEY = 'anyPermissions';

export const RequirePermissions = (...permissions: PermissionKey[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

export const RequireAnyPermissions = (...permissions: PermissionKey[]) =>
  SetMetadata(ANY_PERMISSIONS_KEY, permissions);

export interface AuthenticatedCitizen {
  id: string;
  phone: string;
  type: 'citizen';
}

export interface AuthenticatedAdmin {
  id: string;
  email: string;
  type: 'admin';
  roles: string[];
  permissions: string[];
}

export type AuthenticatedUser = AuthenticatedCitizen | AuthenticatedAdmin;

export interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser | undefined => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);

export const IS_PUBLIC_KEY = 'isPublic';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const AUTH_TYPE_KEY = 'authType';

export type AuthType = 'citizen' | 'admin';

export const AuthType = (type: AuthType) => SetMetadata(AUTH_TYPE_KEY, type);
