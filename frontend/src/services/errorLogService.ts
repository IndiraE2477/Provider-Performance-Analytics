import api from './api';
import type { ErrorLog, PagedResult, ApiResponse, ErrorLogQueryParams } from '../types';

export const errorLogService = {
  getErrorLogs: async (params: ErrorLogQueryParams): Promise<PagedResult<ErrorLog>> => {
    const response = await api.get<ApiResponse<PagedResult<ErrorLog>>>('/errorlogs', { params });
    return response.data.data;
  },
};
