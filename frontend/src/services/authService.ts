import api from './api';
import type { LoginRequest, RegisterRequest, LoginResponse, ApiResponse, User, ProviderListItem } from '../types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    return response.data.data;
  },

  register: async (data: RegisterRequest): Promise<User> => {
    const response = await api.post<ApiResponse<User>>('/auth/register', data);
    return response.data.data;
  },

  getProviders: async (): Promise<ProviderListItem[]> => {
    const response = await api.get<ApiResponse<ProviderListItem[]>>('/auth/providers');
    return response.data.data;
  },
};
