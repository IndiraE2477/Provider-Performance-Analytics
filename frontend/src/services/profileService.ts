import api from './api';
import type { Profile, UpdateProfile, ChangePassword, ApiResponse } from '../types';

export const profileService = {
  getProfile: async (): Promise<Profile> => {
    const response = await api.get<ApiResponse<Profile>>('/profile');
    return response.data.data;
  },

  updateProfile: async (data: UpdateProfile): Promise<Profile> => {
    const response = await api.put<ApiResponse<Profile>>('/profile', data);
    return response.data.data;
  },

  changePassword: async (data: ChangePassword): Promise<void> => {
    await api.put('/profile/change-password', data);
  },
};
