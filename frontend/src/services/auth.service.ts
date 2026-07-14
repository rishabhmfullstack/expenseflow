import { api } from '@/lib/api';
import type { AuthResponse, User } from '@/types';

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const authService = {
  async login(input: LoginInput) {
    const { data } = await api.post<{ success: true; data: AuthResponse }>('/auth/login', input);
    return data.data;
  },

  async signup(input: SignupInput) {
    const { data } = await api.post<{ success: true; data: AuthResponse }>('/auth/signup', input);
    return data.data;
  },

  async logout() {
    await api.post('/auth/logout');
  },

  async me() {
    const { data } = await api.get<{ success: true; data: { user: User } }>('/auth/me');
    return data.data.user;
  },
};
