<template>
  <IonPage>
    <IonHeader>
      <toolbar-menu :menuTitle="toolbarTitle" iconName="compass" />
    </IonHeader>

    <IonContent>
      <IonList class="light-list">
        <!-- Öffentliche Routen -->
        <h3>Öffentliche Seiten</h3>
        <IonButton class="custom-button" v-for="route in publicRoutes" :key="route.id" @click="navigateTo(route.path)">
          <span>
            <IonIcon color="primary" :name="route.icon" slot="iconOnly" size="large" class="button-icon" />
          </span>
          <span class="button-text">{{ route.title }}</span>
        </IonButton>

        <!-- HSP-geschützte Routen -->
        <div v-if="loginStateHSP">
          <h3>HSP-Bereich</h3>
          <IonButton class="custom-button" v-for="route in hspRoutes" :key="route.id" @click="navigateTo(route.path)">
            <span>
              <IonIcon color="primary" :name="route.icon" slot="iconOnly" size="large" class="button-icon" />
            </span>
            <span class="button-text">{{ route.title }}</span>
            <span class="auth-type-label">
            </span>
            <IonIcon name="key" slot="end" />
          </IonButton>
        </div>

        <!-- VSC-geschützte Routen -->
        <div v-if="loginStateVSC">
          <h3>VSC-Bereich</h3>
          <IonButton class="custom-button" v-for="route in vscRoutes" :key="route.id" @click="navigateTo(route.path)">
            <span>
              <IonIcon color="primary" :name="route.icon" slot="iconOnly" size="large" class="button-icon" />
            </span>
            <span class="button-text">{{ route.title }}</span>
            <span class="auth-type-label">
            </span>
            <IonIcon name="key" slot="end" />
          </IonButton>
        </div>

        <!-- VPIS-geschützte Routen -->
        <div v-if="loginStateVPIS">
          <h3>VPIS-Bereich</h3>
          <IonButton class="custom-button" v-for="route in vpisRoutes" :key="route.id" @click="navigateTo(route.path)">
            <span>
              <IonIcon color="primary" :name="route.icon" slot="iconOnly" size="large" class="button-icon" />
            </span>
            <span class="button-text">{{ route.title }}</span>
            <span class="auth-type-label">
            </span>
            <IonIcon name="key" slot="end" />
          </IonButton>
        </div>
      </IonList>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { IonHeader, IonPage, IonContent, IonList, IonButton, IonIcon } from "@ionic/vue";
import { useRouter } from "vue-router";
import ToolbarMenu from "./ToolbarMenu.vue";
import { useAuthStore } from "@/stores/authStore";
import { addIcons } from 'ionicons';
import { key, lockClosed, shieldCheckmark, location, restaurant, time, calendar, documentText } from 'ionicons/icons';

addIcons({
  'key': key,
  'lock-closed': lockClosed,
  'shield-checkmark': shieldCheckmark,
  'location': location,
  'restaurant': restaurant,
  'time': time,
  'calendar': calendar,
  'document-text': documentText,
});

const toolbarTitle = ref("Menü");

const authStore = useAuthStore();
const loginStateHSP = computed(() => authStore.isLoggedInHSP);
const loginStateVSC = computed(() => authStore.isLoggedInVSC);
const loginStateVPIS = computed(() => authStore.isLoggedInVPIS); // Stellen Sie sicher, dass dieser Zustand definiert ist

const routes = computed(() => {
  return [
    { id: 0, title: "Mensaplan", icon: 'restaurant', path: "/meals", requiresAuth: false, authType: null },
    { id: 1, title: "Semestertermine", icon: 'time', path: "/semester", requiresAuth: false, authType: null },
    { id: 2, title: "Fachbereichstermine", icon: 'calendar', path: "/departments", requiresAuth: false, authType: null },
    { id: 3, title: "Lagepläne", icon: 'location', path: "/locations", requiresAuth: false, authType: null },
    { id: 4, title: "Meine Prüfungen", icon: 'document-text', path: "/exams", requiresAuth: true, authType: 'VSC' },
    { id: 5, title: "Prüfungspläne", icon: 'document-text', path: "/vpisPruefungsplaene", requiresAuth: false, authType: null },
    { id: 6, title: "Rückmeldung", icon: 'document-text', path: "/payReport", requiresAuth: true, authType: 'HSP' },
    { id: 7, title: "Wochenplan", icon: 'calendar', path: "/calendar", requiresAuth: false, authType: null },
    // authType: 'VPIS'
  ]
});

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
    router.push(path);
  } catch (error) {
    console.log('Navigation error: ', error);
  }
};
</script>

<style scoped>
h3 {
  margin-left: 16px;
  margin-top: 16px;
  margin-bottom: 8px;
  font-size: 1.2em;
  color: #333;
}

.custom-button {
  text-align: center;
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
  --background: #ffffff;
  /* Heller Hintergrund */
  --ion-item-background: #ffffff;
  /* Heller Hintergrund für Items */
  --ion-item-color: #000000;
  /* Schwarzer Text */
}
</style>