<template>
  <v-container fluid class="bg-grey-lighten-4 fill-height align-start pa-6">
    <v-row class="mt-2">
      <v-col cols="12" sm="4">
        <v-card
          border
          flat
          class="pa-4"
          link
          :to="ROUTES.USERS"
          color="secondary"
        >
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-overline mb-1">Total de Usuários</div>
              <div class="text-h4 font-weight-black">
                {{ userStore.totalUsers }}
              </div>
            </div>
            <v-icon size="48" color="white" alpha="0.1"
              >mdi-account-group</v-icon
            >
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card
          border
          flat
          class="pa-4"
          link
          :to="ROUTES.PRODUCTS"
          color="secondary"
        >
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-overline mb-1">Total de Produtos</div>
              <div class="text-h4 font-weight-black">
                {{ productStore.totalProducts }}
              </div>
            </div>
            <v-icon size="48" color="white">mdi-package-variant-closed</v-icon>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card
          border
          flat
          class="pa-4"
          link
          :to="ROUTES.MY_PRODUCTS"
          color="secondary"
        >
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-overline mb-1">Meus Produtos</div>
              <div class="text-h4 font-weight-black">
                {{ myProductStore.totalProducts }}
              </div>
            </div>
            <v-icon size="48" color="white">mdi-tag-heart</v-icon>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card border flat>
          <v-card-title>Distribuição de Preços</v-card-title>
          <v-list lines="two">
            <v-list-item
              v-for="faixa in productStore.priceRangeReport"
              :key="faixa.faixa_preco"
              :title="faixa.faixa_preco"
              :subtitle="`${faixa.total} produtos encontrados`"
            >
              <template v-slot:prepend>
                <v-avatar :color="getRangeColor(faixa.faixa_preco)" size="40">
                  <v-icon color="white">mdi-currency-usd</v-icon>
                </v-avatar>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card border flat>
          <v-card-item prepend-icon="mdi-trophy-outline">
            <v-card-title class="text-wrap line-height-normal">
              Top 10 Usuários (Mais Produtos)
            </v-card-title>
          </v-card-item>
          <v-table density="comfortable">
            <thead>
              <tr>
                <th>Ranking</th>
                <th>Usuário</th>
                <th class="text-right">Qtd. Produtos</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in userStore.rankingUsersReport"
                :key="item.id"
              >
                <td>
                  <v-chip
                    size="small"
                    :color="index < 3 ? 'amber-darken-2' : 'grey'"
                  >
                    #{{ index + 1 }}
                  </v-chip>
                </td>
                <td>{{ item.nome }}</td>
                <td class="text-right font-weight-bold">
                  {{ item.total_produtos }}
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useUserStore } from "../stores/user";
import { useProductStore } from "../stores/product";
import { useMyProductStore } from "../stores/myproduct";
import { ROUTES } from "../constants/routes";

const userStore = useUserStore();
const productStore = useProductStore();
const myProductStore = useMyProductStore();

const getRangeColor = (faixa) => {
  if (faixa.includes("Econômico")) return "green";
  if (faixa.includes("Médio")) return "orange";
  return "red";
};

const loadDashboardData = async () => {
  try {
    await userStore.fetchUsers({ page: 1 });
    await productStore.fetchProducts({ page: 1 });
    await myProductStore.fetchMyProducts({ page: 1 });
    await userStore.fetchRankingUsersReport();
    await productStore.fetchPriceRangeReport();
  } catch (error) {
    console.error("Erro ao carregar dashboard", error);
  }
};

onMounted(loadDashboardData);
</script>

<style scoped>
.v-card {
  transition: transform 0.2s;
}
.v-card:hover {
  transform: translateY(-4px);
}
</style>
