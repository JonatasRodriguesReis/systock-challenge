import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { ROUTES } from "../constants/routes";
import LoginPage from "../pages/LoginPage.vue";
import DashboardPage from "../pages/DashboardPage.vue";
import UserListPage from "../pages/UserListPage.vue";
import ProductsListPage from "../pages/ProductListPage.vue";
import MyProductsListPage from "../pages/MyProductListPage.vue";

const routes = [
  {
    path: ROUTES.LOGIN,
    name: "Login",
    component: LoginPage,
    meta: { guest: true },
  },
  {
    path: ROUTES.DASHBOARD,
    name: "Dashboard",
    component: DashboardPage,
    meta: { auth: true },
  },
  {
    path: ROUTES.USERS,
    name: "Users",
    component: UserListPage,
    meta: { auth: true },
  },
  {
    path: ROUTES.PRODUCTS,
    name: "Products",
    component: ProductsListPage,
    meta: { auth: true },
  },
  {
    path: ROUTES.MY_PRODUCTS,
    name: "My Products",
    component: MyProductsListPage,
    meta: { auth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.auth && !authStore.isAuthenticated) {
    next(ROUTES.LOGIN);
  } else if (to.meta.guest && authStore.isAuthenticated) {
    next(ROUTES.DASHBOARD);
  } else {
    next();
  }
});

export default router;
