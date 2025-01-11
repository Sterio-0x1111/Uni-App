<template>
  <ion-page>
      <ion-header>
          <ion-toolbar>
              <ion-title>Prüfungen</ion-title>
          </ion-toolbar>
      </ion-header>

      <ion-content>
          <h2>Meine Prüfungen</h2>

          <ion-list>
              <ion-button class="custom-button" router-link="/exams/results">Notenspiegel</ion-button>
              <ion-button class="custom-button" router-link="/exams/registered">Angemeldete Prüfungen</ion-button>
              <!--
              <ion-button router-link="/exams/registered">Abgemeldete Prüfungen</ion-button>
              -->
              
              <ion-item button class="custom-button" href="/assets/Ruecktritt-Info-2023.pdf" download="RegelungenRuecktritt.pdf">
                <a>Regelungen Prüfungsrücktritt (Download PDF)</a>
              </ion-item>

              <ion-item><a href="https://www.fh-swf.de/cms/faq/">Hilfe und Hinweise (Weiterleitung auf FH Seite)</a></ion-item>


          </ion-list>
      </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {IonPage, IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonButton } from '@ionic/vue';
import { useRouter } from 'vue-router';

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