import { getApiBaseUrl } from '@/utils/env';

export const API_BASE_URL = getApiBaseUrl();
export const ENV = process.env.NEXT_PUBLIC_ENV || 'development';
