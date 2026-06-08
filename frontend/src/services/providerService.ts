import api from './api';
import type {
  Provider,
  ProviderDetail,
  CreateProvider,
  UpdateProvider,
  PagedResult,
  ApiResponse,
  ProviderQueryParams,
} from '../types';

export const providerService = {
  getProviders: async (params: ProviderQueryParams): Promise<PagedResult<Provider>> => {
    const response = await api.get<ApiResponse<PagedResult<Provider>>>('/providers', { params });
    return response.data.data;
  },

  getProvider: async (id: number): Promise<ProviderDetail> => {
    const response = await api.get<ApiResponse<ProviderDetail>>(`/providers/${id}`);
    return response.data.data;
  },

  createProvider: async (data: CreateProvider): Promise<Provider> => {
    const response = await api.post<ApiResponse<Provider>>('/providers', data);
    return response.data.data;
  },

  updateProvider: async (id: number, data: UpdateProvider): Promise<Provider> => {
    const response = await api.put<ApiResponse<Provider>>(`/providers/${id}`, data);
    return response.data.data;
  },

  deleteProvider: async (id: number): Promise<void> => {
    await api.delete(`/providers/${id}`);
  },

  getSpecialties: async (): Promise<string[]> => {
    const response = await api.get<ApiResponse<string[]>>('/providers/specialties');
    return response.data.data;
  },

  downloadReport: async (id: number, providerName: string): Promise<void> => {
    const response = await api.get(`/providers/${id}/report`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Provider_Report_${providerName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
