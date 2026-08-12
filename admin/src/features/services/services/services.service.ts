import { servicesApi } from './services.api';
import {
  computeServicesStats,
  mapMainServiceDetailToCategory,
} from '../adapters/service.adapter';
import type { CreateServicePayload, ServiceCategory, ServicesStats, WorkflowStage } from '../types';
import { DEFAULT_WORKFLOW_STAGES } from '../constants/mock-data';

async function fetchAllCategories(): Promise<ServiceCategory[]> {
  const { data: mainServices } = await servicesApi.listMainServices(1, 100);
  if (mainServices.length === 0) return [];

  const details = await Promise.all(mainServices.map((ms) => servicesApi.getMainService(ms.id)));
  return details.map(mapMainServiceDetailToCategory);
}

export async function getServicesStats(): Promise<ServicesStats> {
  const categories = await fetchAllCategories();
  return computeServicesStats(categories);
}

export async function getServiceCategories(): Promise<ServiceCategory[]> {
  return fetchAllCategories();
}

export function getWorkflowStages(): Promise<WorkflowStage[]> {
  return Promise.resolve(DEFAULT_WORKFLOW_STAGES);
}

export async function createService(payload: CreateServicePayload): Promise<{ id: string; success: true }> {
  const created = await servicesApi.createMainService({
    name: payload.name,
    description: payload.description,
    isVisible: payload.status === 'active',
  });
  return { id: created.id, success: true };
}

export const servicesService = {
  getServicesStats,
  getServiceCategories,
  getWorkflowStages,
  createService,
};
