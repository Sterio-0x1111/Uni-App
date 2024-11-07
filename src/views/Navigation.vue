<template>
  <ion-page>
    <ion-header>
      <ToolbarMenu menuTitle="ASDF" />
    </ion-header>

    <ion-content>
        <ion-list>
            <ion-button class="routes" v-for="route in routes" :key="route.id" :router-link="route.path">{{ route.title }}</ion-button>
        </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {IonPage, IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonButton } from '@ionic/vue';
import { useRouter } from 'vue-router';
import ToolbarMenu from './ToolbarMenu.vue';

interface Route {
    id: number;
    title: string;
    path: string;
}

const routes: Route[] = [
    { id: 0, title: 'Mensaplan', path: '/meals' },
    { id: 1, title: 'Semestertermine', path: '/semester' },
    { id: 2, title: 'Login', path: '/login' }
]

</script>

<style scoped>
ion-button {
  display: blocK;
  margin-left: 10px; 
  margin-right: 10px;
  margin-top: 10px;
  --background: #1E3A8A;
}
</style>