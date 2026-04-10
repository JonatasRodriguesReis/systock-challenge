<template>
  <v-app>
    <v-main>
      <v-app-bar
        v-if="isAuthenticated"
        color="primary"
        elevation="2"
        style="padding-left: 16px; padding-right: 16px"
      >
        <v-app-bar-title>
          <router-link
            to="/"
            class="font-weight-bold text-white text-decoration-none cursor-pointer"
          >
            Systock
          </router-link>
        </v-app-bar-title>
        <v-spacer></v-spacer>

        <div class="d-none d-sm-flex align-center mr-4">
          <v-avatar color="secondary" size="32" class="mr-2">
            <span class="text-caption">{{
              authStore.user?.nome?.charAt(0)
            }}</span>
          </v-avatar>
          <span class="text-body-2">{{ authStore.user?.nome }}</span>
        </div>

        <v-btn icon @click="handleLogout" color="white">
          <v-icon>mdi-logout</v-icon>
        </v-btn>
      </v-app-bar>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { onMounted, computed } from "vue";
import { useAuthStore } from "./stores/auth";
import { useRouter } from "vue-router";
import { ROUTES } from "./constants/routes";

const authStore = useAuthStore();
const isAuthenticated = computed(() => !!authStore.token);
const router = useRouter();

onMounted(async () => {
  if (authStore.token && !authStore.user) {
    await authStore.fetchUser();
  }
});

const handleLogout = () => {
  authStore.logout();
  router.push(ROUTES.LOGIN);
};
</script>
