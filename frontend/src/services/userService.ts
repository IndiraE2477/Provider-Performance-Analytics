import api from './api';
import type { UserListItem, CreateUser, UpdateUser, ApiResponse } from '../types';

export const userService = {
  getUsers: async (): Promise<UserListItem[]> => {
    const response = await api.get<ApiResponse<UserListItem[]>>('/users');
    return response.data.data;
  },

  getUser: async (id: number): Promise<UserListItem> => {
    const response = await api.get<ApiResponse<UserListItem>>(`/users/${id}`);
    return response.data.data;
  },

  createUser: async (data: CreateUser): Promise<UserListItem> => {
    const response = await api.post<ApiResponse<UserListItem>>('/users', data);
    return response.data.data;
  },

  updateUser: async (id: number, data: UpdateUser): Promise<UserListItem> => {
    const response = await api.put<ApiResponse<UserListItem>>(`/users/${id}`, data);
    return response.data.data;
  },
};
