import { createRouter, createWebHistory } from "vue-router";
import HomePage from "./components/HomePage.vue";
import LoginPage from "./components/LoginPage.vue";
import HealthKnowledgePage from "./components/HealthKnowledgePage.vue";
import HealthKnowledgeDetail from "./components/HealthKnowledgeDetail.vue";
import UsersManagementPage from "./components/UsersManagementPage.vue";
import HealthDataPage from "./components/HealthDataPage.vue";
import AIConsultationPage from "./components/AIConsultationPage.vue";
import DietManagementPage from "./components/DietManagementPage.vue";
import SportManagementPage from "./components/SportManagementPage.vue";
import store from "./store";

const routes = [
  {
    path: "/",
    name: "LoginPage",
    component: LoginPage,
  },
  {
    path: "/home",
    name: "HomePage",
    component: HomePage,
    meta: { requiresAuth: true },
  },
  {
    path: "/health-knowledge/list",
    name: "HealthKnowledgePage",
    component: HealthKnowledgePage,
    meta: { requiresAuth: true },
  },
  {
    path: "/health-knowledge-detail/:health_knowledge_id",
    name: "HealthKnowledgeDetail",
    component: HealthKnowledgeDetail,
    meta: { requiresAuth: true },
  },
  {
    path: "/user-management",
    name: "UsersManagementPage",
    component: UsersManagementPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/health-data",
    name: "HealthDataPage",
    component: HealthDataPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/ai-consultation",
    name: "AIConsultationPage",
    component: AIConsultationPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/diet-management",
    name: "DietManagementPage",
    component: DietManagementPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/sport-management",
    name: "SportManagementPage",
    component: SportManagementPage,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  store.dispatch("checkLoginStatus"); // 检查登录状态
  if (to.meta.requiresAuth && !store.getters.isLoggedIn) {
    // 如果需要登录，且未登录，则跳转到登录页面
    next("/");
  } else {
    next();
  }
});

export default router;
