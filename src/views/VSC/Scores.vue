<template>
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

          <ion-row v-for="row in scores" :key="row" @click="showModal(row)">
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
          </ion-row>
        </ion-grid>

        <ScoreDetails :isOpen="isModalOpen" :data="selectedRowData" @close="isModalOpen = false" />

      </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import {IonPage, IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonSelect, IonSelectOption } from '@ionic/vue';
import { ref, onMounted } from 'vue';
import axios from 'axios';
import ScoreDetails from './ScoreDetails.vue';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

const scores = ref(null);
const isModalOpen = ref(false);
const selectedRowData = ref({});
const url = 'http://localhost:3000/api/vsc/exams/results';

const showModal = (row) => {
  console.log('SHOW');
  selectedRowData.value = {
    Art: row[0],
    Nr: row[1],
    Modul: row[2],
    Semester: row[3],
    Note: row[4],
    Status: row[5],
    Anerkannt: row[6],
    ECTS: row[7],
    Freivermerk: row[8],
    Versuch: row[9],
    Datum: row[10]
  }

  isModalOpen.value = true;
}

onMounted(async () => {
  try{
   
    const response = await axios.get(url, { withCredentials: true });
    if(response.status !== 200){
      throw new Error(`${response.status}`);
    }

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