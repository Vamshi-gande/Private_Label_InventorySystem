import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  withCredentials: true,
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
    }
    return Promise.reject(error);
  },
);

export default api;
