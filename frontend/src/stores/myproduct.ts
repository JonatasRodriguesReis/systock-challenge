import { defineStore } from "pinia";
import api, {
  type APIPaginationParams,
  type APICreateUpdateProductRequest,
} from "../services/api";
import { API_ROUTES } from "../constants/routes";

export const useMyProductStore = defineStore("my_products", {
  state: () => ({
    products: [],
    totalProducts: 0,
    paginationMeta: null,
    loading: false,
  }),

  actions: {
    async fetchMyProducts({
      page,
      per_page,
      search,
      sort_by,
      sort_order,
    }: APIPaginationParams) {
      this.loading = true;
      try {
        const { data: response } = await api.get(API_ROUTES.MY_PRODUCTS, {
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

    async saveProduct(productData: APICreateUpdateProductRequest) {
      if (productData.id) {
        return await api.put(
          `${API_ROUTES.PRODUCTS}/${productData.id}`,
          productData
        );
      }
      return await api.post(API_ROUTES.PRODUCTS, productData);
    },

    async deleteProduct(id: number) {
      return await api.delete(`${API_ROUTES.PRODUCTS}/${id}`);
    },
  },
});
