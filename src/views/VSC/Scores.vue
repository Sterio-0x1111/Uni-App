<template>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Notenspiegel</title>
    </head>

    <body>
      <ion-page>
        <ion-header>
          <ion-toolbar>
            <ion-title>Prüfungen</ion-title>
          </ion-toolbar>
        </ion-header>

        <ion-content>
          <h2>Notenspiegel</h2>
          <h3>Studiengang Informatik</h3>

          <ion-select v-model="selectedOption">
            <ion-select-option v-for="option in selectOptions" :key="option.id" aria-placeholder="Filter auswählen">
                {{ option.text }}
            </ion-select-option>
          </ion-select>

          <ion-grid>
            <ion-row> <!-- Table Headers -->
                <ion-col v-for="header in tableHeaders" :key="header.id">{{header.text}}</ion-col>
            </ion-row>
          </ion-grid>
        </ion-content>
      </ion-page>
    </body>
  </html>
</template>

<script setup lang="ts">
import {IonPage, IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonSelect, IonSelectOption } from '@ionic/vue';
import { ref } from 'vue';

const tableHeaders = [
    {id: 0, text: 'PrfArt' }, 
    {id: 1, text: 'Prüfungsnr.'}, 
    {id: 2, text: 'Prüfungstext'}, 
    {id: 3, text: 'Semester'}, 
    {id: 4, text: 'Note'}, 
    {id: 5, text: 'Status'}, 
    {id: 6, text: 'Anerkannt'}, 
    {id: 7, text: 'ECTS'}, 
    {id: 8, text: 'Freivermerk'}, 
    {id: 9, text: 'Versuch'}, 
    {id: 10, text: 'Prüfungsdatum'}
]

const selectOptions = [
    {id: 0, text: 'Alle Einträge'}, 
    {id: 1, text: 'Modulprüfungen'}, 
    {id: 2, text: 'Studienleistungen'}
]

const selectedOption = ref(selectOptions[1].text);

</script>