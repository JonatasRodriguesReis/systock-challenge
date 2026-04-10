<template>
  <v-container fluid class="pa-6">
    <v-card class="mb-6 pa-4" border flat color="secondary">
      <div class="d-flex justify-space-between align-center">
        <div>
          <div class="text-overline">Gestão de Sistema</div>
          <div class="text-h4 font-weight-bold">
            {{ productStore.totalProducts }} Produtos
          </div>
        </div>
      </div>
    </v-card>

    <v-card border flat>
      <v-card-title class="pa-4">
        <v-text-field
          v-model="search"
          label="Buscar por nome"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          @update:model-value="debounceSearch"
        ></v-text-field>
      </v-card-title>

      <v-data-table-server
        v-model:items-per-page="itemsPerPage"
        :headers="headers"
        :items="productStore.products"
        :items-length="productStore.paginationMeta?.total || 0"
        :loading="productStore.loading"
        :search="search"
        :page="page"
        @update:options="loadItems"
        hover
      >
        <template v-slot:footer>
          <v-pagination
            v-model="page"
            :length="productStore.paginationMeta?.last_page || 1"
            :total-visible="7"
            @update:model-value="onPageChange"
          ></v-pagination>
        </template>
      </v-data-table-server>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import { useProductStore } from "../stores/product";

const productStore = useProductStore();

const search = ref("");
const itemsPerPage = ref(10);
const page = ref(1);

const headers = [
  { title: "ID", key: "id", align: "start" },
  { title: "Nome", key: "nome", align: "start" },
  { title: "Preço", key: "preco", align: "start" },
  { title: "Descrição", key: "descricao", align: "start" },
];

const loadItems = ({ page, itemsPerPage, sortBy }) => {
  productStore.fetchProducts({
    page,
    per_page: itemsPerPage,
    search: search.value,
    sort_by: sortBy[0]?.key || "id",
    sort_order: sortBy[0]?.order || "asc",
  });
};

const debounceSearch = () => {};

const onPageChange = (newPage) => {
  page.value = newPage;
};
</script>
