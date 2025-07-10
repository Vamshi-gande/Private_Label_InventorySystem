import axios from 'axios';
import { API_BASE_URL } from '@/config';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} → ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(`[API] Error ${error.response.status}:`, error.response.data ?? error.message);
    } else if (error.request) {
      console.error('[API] Network error or no response received', error.message);
    }
    return Promise.reject(error);
  },
);

export default api;
