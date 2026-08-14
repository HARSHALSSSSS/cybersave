import { Injectable } from '@nestjs/common';
import { ApplicationStatus, PaymentStatus } from '@prisma/client';

import { PrismaService } from '@/database/database.module';

type DayBucket = { key: string; label: string; start: Date; end: Date };

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const [
      totalApplications,
      pendingApplications,
      completedApplications,
      revenueAgg,
      recentApplications,
    ] = await Promise.all([
      this.prisma.application.count(),
      this.prisma.application.count({
        where: {
          status: {
            in: [
              ApplicationStatus.SUBMITTED,
              ApplicationStatus.UNDER_REVIEW,
              ApplicationStatus.PROCESSING,
              ApplicationStatus.ACTION_REQUIRED,
            ],
          },
        },
      }),
      this.prisma.application.count({
        where: { status: ApplicationStatus.COMPLETED },
      }),
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.CAPTURED },
        _sum: { amount: true },
      }),
      this.prisma.application.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          citizen: { select: { phone: true, firstName: true, lastName: true } },
          serviceVersion: { include: { overview: true, subService: true } },
          payment: { select: { amount: true, status: true } },
          pricingSnapshot: true,
        },
      }),
    ]);

    return {
      totalApplications,
      pendingApplications,
      completedApplications,
      totalRevenue: revenueAgg._sum.amount?.toString() ?? '0',
      recentApplications,
    };
  }

  async revenueTrends(days = 7) {
    const buckets = this.buildDayBuckets(days);
    const since = buckets[0]?.start ?? new Date();

    const payments = await this.prisma.payment.findMany({
      where: {
        status: PaymentStatus.CAPTURED,
        createdAt: { gte: since },
      },
      select: { amount: true, createdAt: true },
    });

    return buckets.map((bucket) => {
      const total = payments
        .filter((p) => p.createdAt >= bucket.start && p.createdAt < bucket.end)
        .reduce((sum, p) => sum + Number(p.amount), 0);
      return { date: bucket.key, label: bucket.label, amount: total };
    });
  }

  async applicationTrends(days = 7) {
    const buckets = this.buildDayBuckets(days);
    const since = buckets[0]?.start ?? new Date();

    const applications = await this.prisma.application.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, status: true },
    });

    return buckets.map((bucket) => {
      const dayApps = applications.filter(
        (app) => app.createdAt >= bucket.start && app.createdAt < bucket.end,
      );
      const submitted = dayApps.length;
      const processing = dayApps.filter((app) =>
        (
          [
            ApplicationStatus.UNDER_REVIEW,
            ApplicationStatus.PROCESSING,
            ApplicationStatus.ACTION_REQUIRED,
            ApplicationStatus.SUBMITTED,
          ] as ApplicationStatus[]
        ).includes(app.status),
      ).length;
      const completed = dayApps.filter(
        (app) =>
          app.status === ApplicationStatus.COMPLETED ||
          app.status === ApplicationStatus.APPROVED,
      ).length;
      const rejected = dayApps.filter(
        (app) => app.status === ApplicationStatus.REJECTED,
      ).length;

      return {
        date: bucket.key,
        label: bucket.label,
        submitted,
        processing,
        completed,
        rejected,
      };
    });
  }

  async serviceShare(limit = 6) {
    const grouped = await this.prisma.application.groupBy({
      by: ['serviceVersionId'],
      _count: { _all: true },
      orderBy: { _count: { serviceVersionId: 'desc' } },
      take: limit,
    });

    if (grouped.length === 0) {
      return [];
    }

    const versionIds = grouped.map((row) => row.serviceVersionId);
    const versions = await this.prisma.serviceVersion.findMany({
      where: { id: { in: versionIds } },
      include: {
        overview: true,
        subService: true,
      },
    });

    const versionMap = new Map(versions.map((v) => [v.id, v]));
    const total = grouped.reduce((sum, row) => sum + row._count._all, 0) || 1;

    return grouped.map((row) => {
      const version = versionMap.get(row.serviceVersionId);
      const name =
        version?.overview?.displayName ??
        version?.subService.name ??
        'Unknown service';
      const count = row._count._all;
      return {
        service: name,
        count,
        percent: Math.round((count / total) * 100),
      };
    });
  }

  async operatorLogs(limit = 8) {
    const logs = await this.prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      where: { actorAdminId: { not: null } },
      include: {
        actorAdmin: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });

    return logs.map((log) => ({
      id: log.id,
      action: log.action,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      createdAt: log.createdAt,
      operatorName: [log.actorAdmin?.firstName, log.actorAdmin?.lastName]
        .filter(Boolean)
        .join(' ')
        .trim() || log.actorAdmin?.email || 'Operator',
      operatorEmail: log.actorAdmin?.email ?? '',
    }));
  }

  async documentActivityTrends(days = 7) {
    const buckets = this.buildDayBuckets(days);
    const since = buckets[0]?.start ?? new Date();

    const uploads = await this.prisma.applicationDocument.findMany({
      where: { uploadedAt: { gte: since } },
      select: { uploadedAt: true },
    });

    return buckets.map((bucket) => ({
      date: bucket.key,
      label: bucket.label,
      uploads: uploads.filter(
        (doc) => doc.uploadedAt >= bucket.start && doc.uploadedAt < bucket.end,
      ).length,
    }));
  }

  private buildDayBuckets(days: number): DayBucket[] {
    const buckets: DayBucket[] = [];
    const normalizedDays = Math.min(Math.max(days, 1), 90);

    for (let offset = normalizedDays - 1; offset >= 0; offset -= 1) {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - offset);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      buckets.push({
        key: start.toISOString().slice(0, 10),
        label: start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        start,
        end,
      });
    }

    return buckets;
  }
}
