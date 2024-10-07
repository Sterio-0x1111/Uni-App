import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import Meals from '../views/Meals.vue';
import Data from '../views/Data.vue';
import VpisLogin from '../views/vpisLogin.vue';
import VpisPlaner from '../views/Planer.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/home",
    name: "Home",
    component: HomePage,
  },
  {
    path: "/meals",
    name: "Meals",
    component: Meals,
  },
  {
    path: "/data",
    name: "Data",
    component: Data,
  },
  {
    path: "/vpisLogin",
    name: "VpisLogin",
    component: VpisLogin,
  },
  {
    path: "/vpisPlaner",
    name: "VpisPlaner",
    component: VpisPlaner,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router