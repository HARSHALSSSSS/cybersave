import type { ServiceCategory, ServiceStatus, ServicesStats, SubService } from '../types';
import type { MainService, MainServiceDetail, SubServiceSummary } from '../services/services.api';

function mapMainServiceStatus(status: string): ServiceStatus {
  if (status === 'ACTIVE') return 'active';
  if (status === 'INACTIVE') return 'inactive';
  return 'maintenance';
}

function mapSubServiceStatus(sub: SubServiceSummary): ServiceStatus {
  const lifecycle = sub.latestVersion?.lifecycleStatus;
  if (lifecycle === 'PUBLISHED') return 'active';
  if (lifecycle === 'DRAFT') return 'inactive';
  return 'maintenance';
}

function parseProcessingHours(processingTime?: string | null): number {
  if (!processingTime) return 48;
  const match = processingTime.match(/(\d+)/);
  if (!match) return 48;
  const days = Number(match[1]);
  return Number.isFinite(days) ? days * 24 : 48;
}

export function mapSubServiceToUi(sub: SubServiceSummary, categoryName: string): SubService {
  const summary = sub.publishedSummary;
  return {
    id: sub.id,
    name: sub.name,
    slug: sub.slug,
    categoryName,
    slaHours: parseProcessingHours(summary?.processingTime),
    govtFee: summary?.baseFee ?? 0,
    status: mapSubServiceStatus(sub),
    versionStatus: sub.latestVersion?.lifecycleStatus ?? 'NONE',
    publishedVersionId: summary?.versionId,
    processingTime: summary?.processingTime ?? undefined,
    assistedEnabled: summary?.assistedEnabled ?? false,
    manualEnabled: summary?.manualEnabled ?? false,
    requiresStateSelection: summary?.requiresStateSelection ?? false,
    stateCount: summary?.stateCount ?? 0,
    formFieldCount: summary?.formFieldCount ?? 0,
    documentCount: summary?.documentCount ?? 0,
  };
}

export function mapMainServiceDetailToCategory(detail: MainServiceDetail): ServiceCategory {
  return {
    id: detail.id,
    name: detail.name,
    description: detail.description ?? '',
    status: mapMainServiceStatus(detail.status),
    subServices: detail.subServices.map((sub) => mapSubServiceToUi(sub, detail.name)),
  };
}

export function computeServicesStats(categories: ServiceCategory[]): ServicesStats {
  const allSubs = categories.flatMap((c) => c.subServices);
  return {
    total: allSubs.length,
    active: allSubs.filter((s) => s.status === 'active').length,
    underMaintenance: allSubs.filter((s) => s.status !== 'active').length,
    totalRequestsYtd: 0,
  };
}

export function mapMainServiceListItem(item: MainService): ServiceCategory {
  return {
    id: item.id,
    name: item.name,
    description: item.description ?? '',
    status: mapMainServiceStatus(item.status),
    subServices: [],
  };
}
