import { api } from '../lib/api';

interface RegisterPayload { name: string; email: string; password: string; organizationName: string; }
interface LoginPayload { email: string; password: string; }
interface AuthResponse { userId: string; accessToken: string; refreshToken: string; }

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', payload);
    return response.data;
  },
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', payload);
    return response.data;
  },
};
