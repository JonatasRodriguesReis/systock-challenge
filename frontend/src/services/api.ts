import axios from "axios";
import { useAuthStore } from "../stores/auth";
import { ROUTES } from "@/constants/routes";

//Define the api auth type
export type APIAuthRequest = {
  email: string;
  senha: string;
};

export type APIPaginationParams = {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
};

export type APICreateUpdateUserRequest = {
  id?: number;
  nome: string;
  cpf: string;
  email: string;
  senha: string;
  senha_confirmation: string;
};

export type APICreateUpdateProductRequest = {
  id?: number;
  nome: string;
  descricao: string;
  preco: number;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
      window.location.href = ROUTES.LOGIN;
    }
    return Promise.reject(error);
  }
);

export default api;
