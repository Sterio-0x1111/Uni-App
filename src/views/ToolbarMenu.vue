<template>
  <ion-toolbar>
    <ion-title>{{ menuTitle }}</ion-title>
    <ion-buttons slot="end">
      <ion-button router-link="/navigation">
        <ion-icon name="menu"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</template>

<script lang="ts">
import {IonPage, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon } from '@ionic/vue';
import { defineProps } from 'vue';
const props = defineProps({
  menuTitle: {
    type: String, 
    required: true
  }
});
</script>

<style scoped>
</style>