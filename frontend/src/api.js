import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refresh = localStorage.getItem("refresh");
      if (refresh) {
        originalRequest._retry = true;
        try {
          const res = await axios.post(
            `${api.defaults.baseURL}token/refresh/`,
            { refresh }
          );
          localStorage.setItem("access", res.data.access);
          if (res.data.refresh) {
            localStorage.setItem("refresh", res.data.refresh);
          }
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } else {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
