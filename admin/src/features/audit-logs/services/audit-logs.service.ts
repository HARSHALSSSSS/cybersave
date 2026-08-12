import { apiClient } from '@/services/api/client';

import { unwrapPaginated } from '@/services/api/types';

import { getTotalFromMeta } from '@/services/api/pagination';

import { computeAuditStats, mapAuditLogEntry } from '../adapters/audit-log.adapter';

import type { AuditEventCategory, AuditLogEntry, AuditLogsStats } from '../types';



export interface GetAuditLogsParams {

  search?: string;

  category?: AuditEventCategory | 'all';

  user?: string;

  page?: number;

  pageSize?: number;

}



export interface GetAuditLogsResult {

  data: AuditLogEntry[];

  total: number;

  page: number;

  pageSize: number;

}



export async function getAuditLogsStats(): Promise<AuditLogsStats> {

  const result = await getAuditLogs({ page: 1, pageSize: 50 });

  return computeAuditStats(result.data, result.total);

}



export async function getAuditLogs(params: GetAuditLogsParams = {}): Promise<GetAuditLogsResult> {

  const { search = '', category = 'all', user = 'all', page = 1, pageSize = 8 } = params;



  const response = await apiClient.get('/admin/audit-logs', { params: { page, limit: pageSize } });

  const { data, meta } = unwrapPaginated<Parameters<typeof mapAuditLogEntry>[0][]>(response);



  let entries = data.map(mapAuditLogEntry);



  if (category !== 'all') {

    entries = entries.filter((log) => log.category === category);

  }

  if (user !== 'all') {

    entries = entries.filter((log) => log.userName === user);

  }

  if (search.trim()) {

    const query = search.trim().toLowerCase();

    entries = entries.filter(

      (log) =>

        log.action.toLowerCase().includes(query) ||

        log.resource.toLowerCase().includes(query) ||

        log.userName.toLowerCase().includes(query),

    );

  }



  return {

    data: entries,

    total: getTotalFromMeta(meta),

    page,

    pageSize,

  };

}



function escapeCsv(value: string): string {

  if (/[",\n]/.test(value)) {

    return `"${value.replace(/"/g, '""')}"`;

  }

  return value;

}



export async function exportAuditLog(): Promise<{ success: true }> {

  const response = await apiClient.get('/admin/audit-logs', { params: { page: 1, limit: 500 } });

  const { data } = unwrapPaginated<Parameters<typeof mapAuditLogEntry>[0][]>(response);

  const entries = data.map(mapAuditLogEntry);



  const header = ['Timestamp', 'User', 'Action', 'Resource', 'Category', 'Status'];

  const rows = entries.map((log) =>

    [

      log.timestamp,

      log.userName,

      log.action,

      log.resource,

      log.category,

      log.status,

    ]

      .map((cell) => escapeCsv(String(cell)))

      .join(','),

  );



  const csv = [header.join(','), ...rows].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');

  link.href = url;

  link.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;

  link.click();

  URL.revokeObjectURL(url);



  return { success: true };

}



export const auditLogsService = {

  getAuditLogsStats,

  getAuditLogs,

  exportAuditLog,

};

