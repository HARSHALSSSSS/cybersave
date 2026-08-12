import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { SYSTEM_ROLE_KEYS } from '../src/common/constants/auth.constants';
import {
  ALL_PERMISSIONS,
  PERMISSIONS,
} from '../src/common/constants/permissions.constants';
import { seedGovernmentServices } from './seed-services';
import { seedHomeBanners } from './seed-banners';

const prisma = new PrismaClient();

const ROLE_PERMISSION_MAP: Record<string, string[]> = {
  [SYSTEM_ROLE_KEYS.SUPER_ADMIN]: ALL_PERMISSIONS.map((p) => p.key),
  [SYSTEM_ROLE_KEYS.ADMIN]: [
    PERMISSIONS.SERVICE_CREATE,
    PERMISSIONS.SERVICE_UPDATE,
    PERMISSIONS.SERVICE_PUBLISH,
    PERMISSIONS.SERVICE_ARCHIVE,
    PERMISSIONS.FORM_CREATE,
    PERMISSIONS.FORM_UPDATE,
    PERMISSIONS.FORM_PUBLISH,
    PERMISSIONS.WORKFLOW_CONFIGURE,
    PERMISSIONS.APPLICATION_VIEW_ALL,
    PERMISSIONS.APPLICATION_ASSIGN,
    PERMISSIONS.APPLICATION_TRANSITION,
    PERMISSIONS.APPLICATION_APPROVE,
    PERMISSIONS.APPLICATION_REJECT,
    PERMISSIONS.APPLICATION_REQUEST_CORRECTION,
    PERMISSIONS.PAYMENT_VIEW,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_MANAGE,
    PERMISSIONS.AUDIT_VIEW,
    PERMISSIONS.REPORTS_VIEW,
  ],
  [SYSTEM_ROLE_KEYS.OPERATOR]: [
    PERMISSIONS.APPLICATION_VIEW,
    PERMISSIONS.APPLICATION_TRANSITION,
    PERMISSIONS.APPLICATION_APPROVE,
    PERMISSIONS.APPLICATION_REJECT,
    PERMISSIONS.APPLICATION_REQUEST_CORRECTION,
  ],
  [SYSTEM_ROLE_KEYS.SUPPORT]: [
    PERMISSIONS.APPLICATION_VIEW,
    PERMISSIONS.USER_VIEW,
  ],
  [SYSTEM_ROLE_KEYS.FINANCE]: [
    PERMISSIONS.PAYMENT_VIEW,
    PERMISSIONS.PAYMENT_REFUND,
    PERMISSIONS.REPORTS_VIEW,
  ],
};

async function main() {
  console.log('Seeding roles and permissions...');

  for (const permission of ALL_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: {
        name: permission.name,
        module: permission.module,
        description: permission.description,
      },
      create: permission,
    });
  }

  const roles = [
    {
      key: SYSTEM_ROLE_KEYS.SUPER_ADMIN,
      name: 'Super Admin',
      description: 'Full platform access',
      isSystem: true,
    },
    {
      key: SYSTEM_ROLE_KEYS.ADMIN,
      name: 'Admin',
      description: 'Service and user management',
      isSystem: true,
    },
    {
      key: SYSTEM_ROLE_KEYS.OPERATOR,
      name: 'Operator',
      description: 'Application processing',
      isSystem: true,
    },
    {
      key: SYSTEM_ROLE_KEYS.SUPPORT,
      name: 'Support',
      description: 'Support and limited user access',
      isSystem: true,
    },
    {
      key: SYSTEM_ROLE_KEYS.FINANCE,
      name: 'Finance',
      description: 'Payments and financial reports',
      isSystem: true,
    },
  ];

  for (const role of roles) {
    const dbRole = await prisma.role.upsert({
      where: { key: role.key },
      update: role,
      create: role,
    });

    const permissionKeys = ROLE_PERMISSION_MAP[role.key] ?? [];
    for (const permissionKey of permissionKeys) {
      const permission = await prisma.permission.findUniqueOrThrow({
        where: { key: permissionKey },
      });
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: dbRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: dbRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  const superAdminRole = await prisma.role.findUniqueOrThrow({
    where: { key: SYSTEM_ROLE_KEYS.SUPER_ADMIN },
  });

  const passwordHash = await bcrypt.hash('Admin@123456', 12);
  const adminUser = await prisma.adminUser.upsert({
    where: { email: 'admin@cybersave.local' },
    update: {
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      status: 'ACTIVE',
    },
    create: {
      email: 'admin@cybersave.local',
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      status: 'ACTIVE',
    },
  });

  await prisma.adminUserRole.upsert({
    where: {
      adminUserId_roleId: {
        adminUserId: adminUser.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      adminUserId: adminUser.id,
      roleId: superAdminRole.id,
    },
  });

  console.log('Seed complete.');
  console.log('Super admin: admin@cybersave.local / Admin@123456');

  await seedGovernmentServices(prisma);
  await seedHomeBanners(prisma);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
