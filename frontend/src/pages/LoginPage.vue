<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center" class="fill-height">
      <v-col cols="12" sm="8" md="4" lg="3">
        <v-card class="pa-8" elevation="10" color="primary">
          <v-card-title class="text-h5 text-center py-4">Systock</v-card-title>

          <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
            {{ error }}
          </v-alert>

          <v-form @submit.prevent="handleLogin">
            <v-text-field
              v-model="form.email"
              label="E-mail"
              prepend-inner-icon="mdi-email"
              type="email"
              variant="outlined"
              required
            ></v-text-field>

            <v-text-field
              v-model="form.senha"
              label="Senha"
              prepend-inner-icon="mdi-lock"
              type="password"
              variant="outlined"
              required
            ></v-text-field>

            <v-btn
              type="submit"
              color="secondary"
              block
              size="large"
              :loading="loading"
              class="mt-4"
            >
              Entrar
            </v-btn>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";
import { ROUTES } from "../constants/routes";

const authStore = useAuthStore();
const router = useRouter();

const form = reactive({ email: "", senha: "" });
const loading = ref(false);
const error = ref(null);

const handleLogin = async () => {
  loading.value = true;
  error.value = null;
  try {
    await authStore.login(form);
    router.push(ROUTES.DASHBOARD);
  } catch (err) {
    error.value =
      err.response?.data?.message ||
      "Credenciais inválidas ou erro de conexão.";
  } finally {
    loading.value = false;
  }
};
</script>
