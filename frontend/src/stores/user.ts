import { defineStore } from "pinia";
import api, {
  type APIPaginationParams,
  type APICreateUpdateUserRequest,
} from "../services/api";
import { API_ROUTES } from "../constants/routes";

export const useUserStore = defineStore("users", {
  state: () => ({
    users: [],
    totalUsers: 0,
    rankingUsersReport: [],
    paginationMeta: null,
    loading: false,
  }),

  actions: {
    async fetchUsers({
      page,
      per_page,
      search,
      sort_by,
      sort_order,
    }: APIPaginationParams) {
      this.loading = true;
      try {
        const { data: response } = await api.get(API_ROUTES.USERS, {
          params: { page, per_page, search, sort_by, sort_order },
        });
        this.users = response.data;
        this.paginationMeta = response.meta;
        //Update total users only when is not a search
        if (!search) {
          this.totalUsers = response.meta.total || 0;
        }
      } finally {
        this.loading = false;
      }
    },

    async fetchRankingUsersReport() {
      try {
        const { data: response } = await api.get(API_ROUTES.RANKING_REPORT);
        this.rankingUsersReport = response.data;
      } catch (error) {
        console.error("Failed to fetch ranking users report:", error);
      }
    },

    async saveUser(userData: APICreateUpdateUserRequest) {
      if (userData.id) {
        const updateData = {
          nome: userData.nome,
          email: userData.email,
          cpf: userData.cpf,
        };

        return await api.put(`${API_ROUTES.USERS}/${userData.id}`, updateData);
      }
      return await api.post(API_ROUTES.USERS, userData);
    },

    async deleteUser(id: number) {
      return await api.delete(`${API_ROUTES.USERS}/${id}`);
    },
  },
});
