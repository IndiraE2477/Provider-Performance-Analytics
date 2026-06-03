import api from './api';
import type { ProviderScore, CreateProviderScore, UpdateProviderScore, ApiResponse } from '../types';

export const scoreService = {
  getScoresByProvider: async (providerId: number): Promise<ProviderScore[]> => {
    const response = await api.get<ApiResponse<ProviderScore[]>>(`/providerscores/provider/${providerId}`);
    return response.data.data;
  },

  createScore: async (data: CreateProviderScore): Promise<ProviderScore> => {
    const response = await api.post<ApiResponse<ProviderScore>>('/providerscores', data);
    return response.data.data;
  },

  updateScore: async (id: number, data: UpdateProviderScore): Promise<ProviderScore> => {
    const response = await api.put<ApiResponse<ProviderScore>>(`/providerscores/${id}`, data);
    return response.data.data;
  },

  deleteScore: async (id: number): Promise<void> => {
    await api.delete(`/providerscores/${id}`);
  },
};
