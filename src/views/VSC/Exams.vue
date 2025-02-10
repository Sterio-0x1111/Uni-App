<template>
  <ion-page>
      <ion-header>
        <toolbar-menu menuTitle="Meine Prüfungen" iconName="document-text" />
      </ion-header>

      <ion-content>
          <ion-list>
              <ion-button id="results" class="custom-button" router-link="/exams/results">Notenspiegel</ion-button>
              <ion-button id="registered" class="custom-button" router-link="/exams/registered">Angemeldete Prüfungen</ion-button>
              <ion-button id="download" class="custom-button" href="/assets/Ruecktritt-Info-2023.pdf" download="RegelungenRuecktritt.pdf">Prüfungsrücktrittsregelung (PDF)</ion-button>
              <ion-button id="" class="custom-button" href="https://www.fh-swf.de/cms/faq/" target="_blank">Hilfe und Hinweise (FH Seite)</ion-button>
          </ion-list>
      </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {IonPage, IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonButton, IonIcon } from '@ionic/vue';
import { useRouter } from 'vue-router';
import ToolbarMenu from '../ToolbarMenu.vue';

const router = useRouter();

const navigateTo = (page) => {
  router.push(page);
}



</script>

<script lang="ts">
export default {
  
}
</script>

<style scoped>
ion-item {
  margin-top: 10px;
}
/*
ion-button {
  display: blocK;
  margin-left: 10px; 
  margin-right: 10px;
  margin-top: 10px;
  --background: #1E3A8A;
  
  
}*/
</style>