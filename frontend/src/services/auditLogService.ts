import api from './api';
import type { AuditLogEntry, PagedResult, ApiResponse, AuditLogQueryParams } from '../types';

export const auditLogService = {
  getAuditLogs: async (params: AuditLogQueryParams): Promise<PagedResult<AuditLogEntry>> => {
    const response = await api.get<ApiResponse<PagedResult<AuditLogEntry>>>('/auditlogs', { params });
    return response.data.data;
  },
};
