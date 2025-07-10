import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
  // Include credentials if backend requires auth cookies
  withCredentials: true,
});

export default api; 