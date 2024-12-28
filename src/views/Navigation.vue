<template>
  <ion-page>
    <ion-header>
      <toolbar-menu :menuTitle="toolbarTitle" />
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-button class="custom-button" v-for="route in filteredRoutes" :key="route.id"  :router-link="route.path">
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
  { id: 2, title: "Fachbereichstermine", path: "/departments", requiresAuth: false },
  //{ id: 2, title: "Login", path: "/login", requiresAuth: false },
  { id: 3, title: "Lagepläne", path: "/locations", requiresAuth: false },
  { id: 4, title: "Meine Prüfungen", path: "/exams", requiresAuth: true },
];

const filteredRoutes = computed(() => {
  return routes.filter((route) => {
    //if (loginState.value && route.path === "/login") {
      // Login-Route ausblenden, wenn der Benutzer eingeloggt ist
      //return false;
    //}
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
ion-button{
  display: blocK;
  margin-left: 10px;
  margin-right: 10px;
  margin-top: 10px;
  
}

.custom-button {
  --background: transparent;
  --color: #ffffff;
  --padding-start: 20px;
  --padding-end: 20px;
  --height: 50px;
  --border-width: 3px;
  --border-style: solid;
  --border-color: blue;
  --border-radius: 50px;
  position: relative;
  margin-top: 20px;
  font-size: 16px;
}

.custom-button:before {
  content: '';
  position: absolute;
  inset: 0; /* Füllt den gesamten Button aus */
  border-radius: inherit;
  padding: 2px; /* Abstand für den Farbverlauf */
  --background: linear-gradient(90deg, #d32f7e, #a2275e); /* Farbverlauf */
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
  -webkit-mask-composite: xor;
}
</style>