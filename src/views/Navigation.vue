<template>
  <ion-page>
    <ion-header>
      <toolbar-menu :menuTitle="toolbarTitle" iconName="compass" />
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-button class="custom-button" v-for="route in filteredRoutes" :key="route.id"  @click="navigateTo(route.path)">
          <span><ion-icon color="primary" :name="route.icon" slot="iconOnly" size="large" class="button-icon"></ion-icon></span>
          <span class="button-text">{{ route.title }}</span>
          <ion-icon name="key" v-if="route.requiresAuth" slot="end">

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
//const loginStateVSC = computed(() => authStore.isLoggedInVSC);
const loginStateVSC = computed(() => authStore.isLoggedInVSC);
console.log(loginStateVSC.value)

/*const routes: Route[] = [
  { id: 0, title: "Mensaplan",            icon: 'restaurant',     path: "/meals",       requiresAuth: false, login: false },
  { id: 1, title: "Semestertermine",      icon: 'time',           path: "/semester",    requiresAuth: false, login: false },
  { id: 2, title: "Fachbereichstermine",  icon: 'calendar',       path: "/departments", requiresAuth: false, login: false },
  { id: 3, title: "Lagepläne",            icon: 'location',       path: "/locations",   requiresAuth: false, login: false },
  { id: 4, title: "Meine Prüfungen",      icon: 'document-text',  path: "/exams",       requiresAuth: true,  login: loginStateVSC.value },
//{ id: 2, title: "Login", path: "/login", requiresAuth: false },
];*/

const routes = computed(() => {
  return [
  { id: 0, title: "Mensaplan",            icon: 'restaurant',     path: "/meals",       requiresAuth: false, login: false },
  { id: 1, title: "Semestertermine",      icon: 'time',           path: "/semester",    requiresAuth: false, login: false },
  { id: 2, title: "Fachbereichstermine",  icon: 'calendar',       path: "/departments", requiresAuth: false, login: false },
  { id: 3, title: "Lagepläne",            icon: 'location',       path: "/locations",   requiresAuth: false, login: false },
  { id: 4, title: "Meine Prüfungen",      icon: 'document-text',  path: "/exams",       requiresAuth: true,  login: loginStateVSC.value },
]
});

const filteredRoutes = computed(() => {
  return routes.value.filter((route) => {
    if(route.requiresAuth){
      return route.login;
    }
    return true;
  })

  /*return routes.filter((route) => {
    if (!loginState.value && route.requiresAuth) {
      // Geschützte Routen ausblenden, wenn der Benutzer nicht eingeloggt ist
      return false;
    }
    // Ansonsten die Route anzeigen
    return true;
  });*/
});


interface Route {
  id: number;
  title: string;
  path: string;
  requiresAuth: boolean;
  login: boolean;
}

import { addIcons } from 'ionicons'; 
import { key, location, restaurant, time, calendar, documentText} from 'ionicons/icons'; 
addIcons({ 
  'key': key,
  'location': location,
  'restaurant': restaurant,
  'time': time,
  'calendar': calendar,
  'document-text': documentText,
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
.custom-button {
  justify-content: flex start;
  text-align: center;
  position: relative;
}

.button-icon {
  position: relative;
  left: 16px;
  font-size: 200px;
  
}

.button-text {
  flex: 1;
}
</style>