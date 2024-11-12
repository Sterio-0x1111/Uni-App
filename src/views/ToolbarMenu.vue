<template>
  <ion-toolbar>
    <ion-title>{{ menuTitle }}</ion-title>
    <ion-buttons slot="end">
      <ion-button router-link="/navigation">
        x<ion-icon name="home"></ion-icon>
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
</script>

<style scoped>
</style>