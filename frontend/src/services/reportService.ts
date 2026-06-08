import api from './api';
import type { ReportData, ApiResponse } from '../types';

export const reportService = {
  getReportData: async (): Promise<ReportData> => {
    const response = await api.get<ApiResponse<ReportData>>('/reports');
    return response.data.data;
  },

  downloadCsv: async (): Promise<void> => {
    const response = await api.get('/reports/download/csv', {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `provider-analytics-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
