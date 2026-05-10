import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  withCredentials: true,
});

let isRefreshing = false;
let queue: Array<() => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          queue.push(() => resolve(api(original)));
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        await api.post("/auth/refresh");
        queue.forEach((fn) => fn());
        queue = [];
        return api(original);
      } catch {
        queue = [];
        window.location.href = "/";
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(err);
  }
);

export default api;
