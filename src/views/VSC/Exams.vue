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
            <!--
              <ion-item><a href="http://localhost:8100/exams/results">Notenspiegel</a></ion-item>
              -->
              <ion-button router-link="/exams/results">Notenspiegel</ion-button>
              <ion-item><a>Angemeldete Prüfungen</a></ion-item>
              <ion-item><a>Abgemeldete Prüfungen</a></ion-item>
              
              <ion-item button href="/assets/Ruecktritt-Info-2023.pdf" download="RegelungenRuecktritt.pdf">
                <a>Regelungen Prüfungsrücktritt (Download PDF)</a>
              </ion-item>

              <ion-item><a href="https://www.fh-swf.de/cms/faq/">Hilfe und Hinweise (Weiterleitung auf FH Seite)</a></ion-item>


          </ion-list>
      </ion-content>
  </ion-page>
</template>

<script setup>
import {IonPage, IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonButton } from '@ionic/vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const navigateTo = (page) => {
  router.push(page);
}



</script>

<style scoped>
ion-item {
  margin-top: 10px;
}
</style>