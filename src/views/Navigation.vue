<template>
  <ion-page>
    <ion-header>
      <toolbar-menu :menuTitle="toolbarTitle" />
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-button v-for="route in filteredRoutes" :key="route.id" class="routes" :router-link="route.path">
          {{ route.title }}
        </ion-button>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {IonPage, IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonButton, } from "@ionic/vue";
import { useRouter } from "vue-router";
import ToolbarMenu from "./ToolbarMenu.vue";
import { useAuthStore } from "@/stores/authStore";

const toolbarTitle = ref("Menü");  
const authStore = useAuthStore();
const loginState = computed(() => authStore.isLoggedIn);

const routes: Route[] = [
  { id: 0, title: "Mensaplan", path: "/meals", requiresAuth: false },
  { id: 1, title: "Semestertermine", path: "/semester", requiresAuth: false },
  { id: 2, title: "Login", path: "/login", requiresAuth: false },
  { id: 3, title: "Meine Prüfungen", path: "/exams", requiresAuth: true },
];

const filteredRoutes = computed(() => {
  return routes.filter((route) => {
    if (loginState.value && route.path === "/login") {
      // Login-Route ausblenden, wenn der Benutzer eingeloggt ist
      return false;
    }
    if (!loginState.value && route.requiresAuth) {
      // Geschützte Routen ausblenden, wenn der Benutzer nicht eingeloggt ist
      return false;
    }
    // Ansonsten die Route anzeigen
    return true;
  });
});


interface Route {
  id: number;
  title: string;
  path: string;
  requiresAuth: boolean;
}
</script>

<style scoped>
ion-button {
  display: blocK;
  margin-left: 10px;
  margin-right: 10px;
  margin-top: 10px;
  --background: #1e3a8a;
}
</style>