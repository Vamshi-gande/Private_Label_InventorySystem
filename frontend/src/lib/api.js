import axios from 'axios';
import { API_BASE_URL } from '@/config';

// Create axios instance with retry configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout for better reliability
  retry: 3,
  retryDelay: 1000,
});

// Add retry logic
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} → ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config } = error;
    
    // Enhanced error logging
    if (error.response) {
      console.error(`[API] Error ${error.response.status}:`, error.response.data ?? error.message);
    } else if (error.request) {
      console.error('[API] Network error or no response received', error.message);
    } else {
      console.error('[API] Request setup error:', error.message);
    }

    // Retry logic for network errors and 5xx server errors
    if (config && !config.__isRetryRequest) {
      const shouldRetry = (
        error.code === 'ECONNREFUSED' ||
        error.code === 'ECONNRESET' ||
        error.code === 'ENOTFOUND' ||
        error.code === 'ETIMEDOUT' ||
        error.message.includes('Network Error') ||
        (error.response && error.response.status >= 500)
      );

      if (shouldRetry && config.retry > 0) {
        config.__isRetryRequest = true;
        config.retry--;
        
        const retryDelay = config.retryDelay || 1000;
        console.log(`[API] Retrying request in ${retryDelay}ms... (${config.retry} retries left)`);
        
        await delay(retryDelay);
        return api(config);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
export const apiClient = api;
