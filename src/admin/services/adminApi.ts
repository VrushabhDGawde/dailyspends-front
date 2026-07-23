import axios from 'axios';

// Since the auth service is running on port 8080 and vite proxies /api to it
const API_URL = '/api/v1/admin';

// Create a specialized axios instance for admin
const adminAxios = axios.create({
  baseURL: API_URL,
});

// Interceptor to attach the JWT token
adminAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('spendsense_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types based on Backend DTOs
export interface UserResponseDTO {
  id: number;
  uuid: string;
  fullName: string;
  email: string;
  role: 'USER' | 'ADMIN';
  enabled: boolean;
  emailVerified: boolean;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export const adminApi = {
  // Fetch users with pagination
  fetchUsers: async (page = 0, size = 10): Promise<PageResponse<UserResponseDTO>> => {
    const response = await adminAxios.get(`/users?page=${page}&size=${size}`);
    return response.data;
  },

  // Block or Unblock a user
  updateUserStatus: async (id: number, enabled: boolean): Promise<UserResponseDTO> => {
    const response = await adminAxios.put(`/users/${id}/status`, { enabled });
    return response.data;
  },

  // Change user role
  updateUserRole: async (id: number, role: 'USER' | 'ADMIN'): Promise<UserResponseDTO> => {
    const response = await adminAxios.put(`/users/${id}/role`, { role });
    return response.data;
  },

  // Delete user
  deleteUser: async (id: number): Promise<void> => {
    await adminAxios.delete(`/users/${id}`);
  },
};
