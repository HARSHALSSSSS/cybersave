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

export function mapSubServiceToUi(sub: SubServiceSummary, categoryName: string): SubService {
  const pricing = 0;
  return {
    id: sub.id,
    name: sub.name,
    categoryName,
    slaHours: 48,
    govtFee: pricing,
    status: mapSubServiceStatus(sub),
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
    underMaintenance: allSubs.filter((s) => s.status === 'maintenance').length,
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
