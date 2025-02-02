<template>
  <ion-page>
    <ion-header>
      <toolbar-menu menuTitle="Menü" iconName="compass" />
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

const authStore = useAuthStore();
const loginState = computed(() => authStore.isLoggedIn);
const loginStateHSP = computed(() => authStore.isLoggedInHSP);
const loginStateVSC = computed(() => authStore.isLoggedInVSC);
const loginStateVPIS = computed(() => authStore.isLoggedInVPIS);

const routes = computed(() => {
  return [
    { id: 0, title: "Mensaplan", icon: 'restaurant', path: "/meals", requiresAuth: false, authType: null },
    { id: 1, title: "Semestertermine", icon: 'time', path: "/semester", requiresAuth: false, authType: null },
    { id: 2, title: "Lagepläne", icon: 'location', path: "/locations", requiresAuth: false, authType: null },
    { id: 3, title: "Fachbereichstermine", icon: 'calendar', path: "/departments", requiresAuth: false, authType: null },
    { id: 4, title: "Prüfungspläne", icon: 'calendar', path: "/vpisPruefungsplaene", requiresAuth: false, authType: null },
    { id: 5, title: "Wochenplan", icon: 'calendar', path: "/calendar", requiresAuth: false, authType: null },
    { id: 6, title: "Veranstaltungsplanende", icon: 'information', path: "/vpisPlaner", requiresAuth: false, authType: null },
    { id: 7, title: "Studieninformationen", icon: 'person', path: "/PersonalInformation", requiresAuth: true, authType: 'HSP' },
    { id: 8, title: "Rückmeldung", icon: 'document-text', path: "/payReport", requiresAuth: true, authType: 'HSP' },
    { id: 9, title: "Meine Prüfungen", icon: 'document-text', path: "/exams", requiresAuth: true, authType: 'VSC' },
    { id: 10, title: "Nachrichten", icon: 'document-text', path: "/news", requiresAuth: true, authType: 'VPIS' },
  ]
});

const filteredRoutes = computed(() => {
  return routes.value.filter((route) => {
    if(route.requiresAuth){
      return route.login;
    }
    return true;
  })
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

const toolbarTitle = ref("Menü");

const publicRoutes = computed(() => {
  return routes.value.filter(route => !route.requiresAuth);
});

const hspRoutes = computed(() => {
  return routes.value.filter(route => route.requiresAuth && route.authType === 'HSP' && loginStateHSP.value);
});

const vscRoutes = computed(() => {
  return routes.value.filter(route => route.requiresAuth && route.authType === 'VSC' && loginStateVSC.value);
});

const vpisRoutes = computed(() => {
  return routes.value.filter(route => route.requiresAuth && route.authType === 'VPIS' && loginStateVPIS.value);
});

const getAuthIcon = (authType: string | null) => {
  switch (authType) {
    case 'HSP':
      return 'shield-checkmark'; // Beispiel-Icon für HSP
    case 'VSC':
      return 'lock-closed';      // Beispiel-Icon für VSC
    case 'VPIS':
      return 'key';              // Beispiel-Icon für VPIS
    default:
      return '';
  }
};

const router = useRouter();
const navigateTo = (path: string) => {
  try {
    console.log('CALLED NAVIGATE TO');
    router.push(path);
  } catch(error){
    console.log('Navigation error: ', error);
  }
};


/*
import { useNavigation }  from '@/composables/useNavigation';
 */
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

.light-list {
  --background: #ffffff; /* Heller Hintergrund */
  --ion-item-background: #ffffff; /* Heller Hintergrund für Items */
  --ion-item-color: #000000; /* Schwarzer Text */
}
</style>