import { defineStore } from "pinia";
import api, { type APIAuthRequest } from "@/services/api";
import { API_ROUTES } from "../constants/routes";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") || null,
    user: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async login(credentials: APIAuthRequest) {
      const { data } = await api.post(API_ROUTES.LOGIN, credentials);
      this.token = data.access_token;
      this.user = data.user;

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
    },

    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },

    async fetchUser() {
      try {
        const { data: response } = await api.get(API_ROUTES.ME);
        this.user = response.data;
      } catch (error) {
        this.logout();
      }
    },
  },
});
