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

          <ion-grid v-if="scores">
            <ion-row> <!-- Table Headers -->
                <ion-col class="table-col" v-for="header in limitedHeaders" :key="header.id"><h4>{{header.text}}</h4></ion-col>
            </ion-row>

            <ion-row v-for="row in scores" :key="row">
              <ion-col>
                <h5>{{ row[0] }}</h5>
              </ion-col>

              <ion-col>
                <h5>{{ row[2] }}</h5>
              </ion-col>

              <ion-col v-if="row[0] !== 'PK'">
                <h5>{{ row[4] }}</h5>
              </ion-col>

              <ion-col v-else>
                <h5>{{ row[3] }}</h5>
              </ion-col>

              <!--
              <ion-col v-for="cell in row" :key="cell">
                {{ console.log('ZELLEN: ', cell) }}
              </ion-col>
              -->
            </ion-row>
          </ion-grid>
        </ion-content>
      </ion-page>
    </body>
  </html>
</template>

<script setup lang="ts">
import {IonPage, IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonSelect, IonSelectOption } from '@ionic/vue';
import { ref, onMounted } from 'vue';
import axios from 'axios';

const scores = ref(null);

onMounted(async () => {
  try{
    // login nur provisorisch, später auslagern eigenes formular, code nur eingeloggt ausführbar
    await axios.get('http://localhost:3000/api/vsc/logout', { withCredentials: true });
    const login = await axios.post('http://localhost:3000/api/vsc/login', { username: '', password: '' }, { withCredentials: true });
    console.log(login);
    const response = await axios.get('http://localhost:3000/api/vsc/exams/results', { withCredentials: true });
    if(response.status !== 200){
      throw new Error(`${response.status}`);
    }
    console.log('DATA:', response.data);
    scores.value = response.data;
    console.log(scores);
  } catch(error){
    console.log(error);
  }
})

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

const limitedHeaders = [tableHeaders[0], tableHeaders[2], tableHeaders[4]];

const selectOptions = [
    {id: 0, text: 'Alle Einträge'}, 
    {id: 1, text: 'Modulprüfungen'}, 
    {id: 2, text: 'Studienleistungen'}
]

const selectedOption = ref(selectOptions[1].text);

</script>

<style scoped>
.table-col {
  justify-content: center;
  margin-left: 5px;
}


</style>