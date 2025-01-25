<template>
  <ion-toolbar class="custom-toolbar">
    <ion-title class="menu-title"><ion-icon :name="iconName"></ion-icon> {{ menuTitle }}</ion-title>
    <!--
    <div class="logo-container">
      <img class="logo" src="/assets/logos/logo_with_text.png" />
    </div>
    -->
    <ion-buttons slot="start">
      <ion-button router-link="/navigation">
        <ion-icon color="primary" name="menu" aria-label="Navigation"></ion-icon> 
      </ion-button>
    </ion-buttons>

    <ion-buttons slot="end">
      <ion-button v-if="!loginStateVSC && router.currentRoute._value.fullPath !== '/login'" router-link="/login">
        <ion-icon color="primary" name="person" aria-label="Login"></ion-icon> 
      </ion-button>

      <ion-button v-if="loginStateVSC" @click="logout">
        <ion-icon color="primary" name="logout" aria-label="Logout"></ion-icon> 
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon } from '@ionic/vue';
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';

import axios from 'axios';
const authStore = useAuthStore();
const loginStateVSC = computed(() => authStore.isLoggedInVSC);
const router = useRouter();

const props = defineProps({
  menuTitle: {
    type: String, 
    required: true
  },
  iconName: {
    type: String, 
    required: false
  }
});

import { addIcons } from 'ionicons'; 
import { home, menu, logIn, list, person, logOut, compass } from 'ionicons/icons'; 
addIcons({ 
  'home': home,
  'menu': menu,
  'login': logIn,
  'logout': logOut,
  'list': list,
  'person': person,
  'compass': compass,
});

const logout = async () => {
  try {
    /*const url = 'http://localhost:3000/api/vsc/logout';
    const response = await axios.get(url, { withCredentials: true });

    if(response.status === 200){
      //authStore.logout();
      //loginState.value = authStore.isLoggedIn;
      await authStore.getStates();
      console.log(loginStateVSC.value);
      router.push('/navigation');
    }*/

   authStore.logout();

  } catch(error){
    console.log('Fehler beim Abmelden.', error);
  }
  // echten auch serverseitig durchführen
}
</script>

<style scoped>
ion-toolbar {
  display: flex;
  justify-content: center; 
  align-items: center; 
}

.menu-title {
  text-align: center; 
  flex-grow: 1;
}


.logo-container {
  display: flex;
  justify-content: center; /* Zentriert das Logo horizontal */
  align-items: center; /* Zentriert das Logo vertikal */
  position: fixed;
  top: 50%; /* Abstand von oben */
  left: 50%; /* Abstand von links */
  z-index: 1000; /* Sicherstellen, dass das Logo immer über anderem Inhalt bleibt */
}

.logo {
  width: 100px; /* Angepasste Größe des Logos */
  height: auto;
}
</style>