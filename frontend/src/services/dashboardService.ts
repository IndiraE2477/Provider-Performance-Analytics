import api from './api';
import type { DashboardAnalytics, AdminSummary, ProviderDashboard, ApiResponse } from '../types';

export const dashboardService = {
  getDashboard: async (): Promise<DashboardAnalytics> => {
    const response = await api.get<ApiResponse<DashboardAnalytics>>('/dashboard');
    return response.data.data;
  },

  getAdminSummary: async (): Promise<AdminSummary> => {
    const response = await api.get<ApiResponse<AdminSummary>>('/dashboard/admin-summary');
    return response.data.data;
  },

  getProviderDashboard: async (providerId: number): Promise<ProviderDashboard> => {
    const response = await api.get<ApiResponse<ProviderDashboard>>(`/dashboard/provider/${providerId}`);
    return response.data.data;
  },
};
