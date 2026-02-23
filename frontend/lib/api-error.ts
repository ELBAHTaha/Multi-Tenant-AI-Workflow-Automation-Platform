import { AxiosError } from 'axios';

export interface ApiErrorPayload {
  success?: boolean;
  error?: {
    code?: number;
    message?: string;
    details?: unknown;
  };
  message?: string;
}

export interface ApiErrorView {
  message: string;
  details?: unknown;
}

export function parseApiError(error: unknown): ApiErrorView {
  const axiosError = error as AxiosError<ApiErrorPayload>;
  const payload = axiosError.response?.data;

  if (payload?.error?.message) {
    return {
      message: payload.error.message,
      details: payload.error.details,
    };
  }

  if (payload?.message) {
    return { message: payload.message };
  }

  if (axiosError.message) {
    return { message: axiosError.message };
  }

  return { message: 'Unknown request error' };
}
