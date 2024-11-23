<template>
  <ion-toolbar>
    <ion-title class="menu-title">{{ menuTitle }}</ion-title>
    <ion-buttons slot="start">
      <ion-button router-link="/navigation">
        <ion-icon name="menu" aria-label="Navigation"></ion-icon> 
      </ion-button>
    </ion-buttons>

    <ion-buttons slot="end">
      <ion-button router-link="/navigation">
        <ion-icon name="login" aria-label="Login"></ion-icon> 
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon } from '@ionic/vue';
import { defineProps, onMounted } from 'vue';

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