import api from './api';
import type { ErrorLog, ApiResponse } from '../types';

export const errorLogService = {
  getErrorLogs: async (): Promise<ErrorLog[]> => {
    const response = await api.get<ApiResponse<ErrorLog[]>>('/errorlogs');
    return response.data.data;
  },
};
