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
};
