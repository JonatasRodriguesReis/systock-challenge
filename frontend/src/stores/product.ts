import { defineStore } from "pinia";
import api, { type APIPaginationParams } from "../services/api";
import { API_ROUTES } from "../constants/routes";

export const useProductStore = defineStore("products", {
  state: () => ({
    products: [],
    totalProducts: 0,
    priceRangeReport: null,
    paginationMeta: null,
    loading: false,
  }),

  actions: {
    async fetchProducts({
      page,
      per_page,
      search,
      sort_by,
      sort_order,
    }: APIPaginationParams) {
      this.loading = true;
      try {
        const { data: response } = await api.get(API_ROUTES.PRODUCTS, {
          params: { page, per_page, search, sort_by, sort_order },
        });
        this.products = response.data;
        this.paginationMeta = response.meta;
        //Update total products only when is not a search
        if (!search) {
          this.totalProducts = response.meta.total || 0;
        }
      } finally {
        this.loading = false;
      }
    },

    async fetchPriceRangeReport() {
      try {
        const { data: response } = await api.get(API_ROUTES.PRICE_RANGE_REPORT);
        this.priceRangeReport = response.data;
      } catch (error) {
        console.error("Failed to fetch price range report:", error);
      }
    },
  },
});
