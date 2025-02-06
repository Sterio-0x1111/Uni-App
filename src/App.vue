<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { onMounted } from 'vue';

onMounted(() => {
  // Setze das Theme manuell auf Light Mode
  //document.documentElement.setAttribute('color-scheme', 'light');
  //document.body.classList.remove('dark');  // Entfernt den Dark Mode, falls er aktiv ist
  //document.body.classList.add('light');    // Fügt den Light Mode hinzu
})
</script>
