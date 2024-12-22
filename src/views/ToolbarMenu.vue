<template>
  <ion-toolbar>
    <ion-title class="menu-title">{{ menuTitle }}</ion-title>
    <ion-buttons slot="start">
      <ion-button router-link="/navigation">
        <ion-icon name="menu" aria-label="Navigation"></ion-icon> 
      </ion-button>
    </ion-buttons>

    <ion-buttons slot="end">
      <ion-button v-if="!loginState" router-link="/login">
        <ion-icon name="login" aria-label="Login"></ion-icon> 
      </ion-button>

      <ion-button v-if="loginState" @click="logout"> <!-- Logout Routine implementieren -->
        <ion-icon name="logout" aria-label="Logout"></ion-icon> 
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon } from '@ionic/vue';
import { ref, computed, defineProps, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
import axios from 'axios';

const authStore = useAuthStore();
const loginState = computed(() => authStore.isLoggedIn);
const router = useRouter();

const props = defineProps({
  menuTitle: {
    type: String, 
    required: true
  }
});

import { addIcons } from 'ionicons'; 
import { home, menu, logIn, list, person, logOut } from 'ionicons/icons'; 
addIcons({ 
  'home': home,
  'menu': menu,
  'login': logIn,
  'logout': logOut,
  'list': list,
  'person': person
});

const logout = async () => {
  try {
    const url = 'http://localhost:3000/api/vsc/logout';
    const response = await axios.get(url, { withCredentials: true });

    if(response.status === 200){
      authStore.logout();
      loginState.value = authStore.isLoggedIn;
      router.push('/navigation');
    }

  } catch(error){
    console.log('Fehler beim Abmelden.', error);
  }
  // echten auch serverseitig durchführen
}
</script>

<script lang="ts">
/*export default {
  name: 'ToolbarMenu'
}*/
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
</style>