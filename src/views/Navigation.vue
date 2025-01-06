<template>
  <ion-page>
    <ion-header>
      <toolbar-menu :menuTitle="toolbarTitle" />
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-button class="custom-button" v-for="route in filteredRoutes" :key="route.id"  @click="navigateTo(route.path)">
          {{ route.title }}
          <ion-icon name="key" v-if="route.requiresAuth" slot="start">

          </ion-icon>
        </ion-button>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {IonPage, IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonButton, IonIcon } from "@ionic/vue";
import { useRouter } from "vue-router";
import ToolbarMenu from "./ToolbarMenu.vue";
import { useAuthStore } from "@/stores/authStore";

const toolbarTitle = ref("Menü");  
const authStore = useAuthStore();
const loginState = computed(() => authStore.isLoggedIn);

const routes: Route[] = [
  { id: 0, title: "Mensaplan",            path: "/meals",       requiresAuth: false },
  { id: 1, title: "Semestertermine",      path: "/semester",    requiresAuth: false },
  { id: 2, title: "Fachbereichstermine",  path: "/departments", requiresAuth: false },
  { id: 3, title: "Lagepläne",            path: "/locations",   requiresAuth: false },
  { id: 4, title: "Meine Prüfungen",      path: "/exams",       requiresAuth: true },
//{ id: 2, title: "Login", path: "/login", requiresAuth: false },
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

import { addIcons } from 'ionicons'; 
import { key } from 'ionicons/icons'; 
addIcons({ 
  'key': key
});

const router = useRouter();
const navigateTo = (path: string) => {
  try {
    console.log('CALLED NAVIGATE TO');
    router.push(path);
  } catch(error){
    console.log('Navigation error: ', error);
  }
};

</script>

<style scoped>

</style>