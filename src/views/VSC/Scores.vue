<template>
    <ion-page>
        <ion-header>
            <toolbar-menu :menuTitle="toolbarTitle" />
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
                    <ion-col class="score-row" v-for="header in limitedHeaders" :key="header.id"><h4>{{header.text}}</h4></ion-col>
                </ion-row>

                <ion-row v-for="row in filteredScores" :key="row" @click="showModal(row)">
                    <ion-col class="score-row">
                        <h5>{{ row[0] }}</h5>
                    </ion-col>

                    <ion-col class="score-row">
                        <h5>{{ row[2] }}</h5>
                    </ion-col>

                    <ion-col class="score-row" v-if="row[0] !== 'PK'">
                        <h5>{{ row[4] }}</h5>
                    </ion-col>

                    <ion-col class="score-row" v-else>
                        <h5>{{ row[3] }}</h5>
                    </ion-col>
                </ion-row>
            </ion-grid>

            <ScoreDetails :isOpen="isModalOpen" :data="selectedRowData" :backdropDismiss="backdropDismiss" @close="isModalOpen = false" />

        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {IonPage, IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonButton, IonSelect, IonSelectOption, IonGrid, IonCol, IonRow } from '@ionic/vue';
import axios from 'axios';
import ScoreDetails from './ScoreDetails.vue';
import ToolbarMenu from '../ToolbarMenu.vue';

const toolbarTitle = 'Notenspiegel';
const scores = ref(null);
const mpScores = ref([]);
const slScores = ref([]);
const pkScores = ref([]);
const isModalOpen = ref(false);
const selectedRowData = ref({});
const backdropDismiss = ref(true); // Dynamisch steuern, ob das Modal durch Klicken auf den Hintergrund geschlossen werden kann
const url = 'http://localhost:3000/api/vsc/exams/results';

const showModal = (row) => {
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

  // Optional: Modus für das Schließen durch den Hintergrund anpassen
  backdropDismiss.value = true; // Falls du das Modal beim Klicken auf den Hintergrund schließen willst
  isModalOpen.value = true;
}

onMounted(async () => {
  try {
    const response = await axios.get(url, { withCredentials: true });
    if (response.status !== 200) {
      throw new Error(`${response.status}`);
    }

    scores.value = response.data;
    
    mpScores.value = scores.value.filter(target => target[0] === 'MP');
    slScores.value = scores.value.filter(target => target[0] === 'SL');
    pkScores.value = scores.value.filter(target => target[0] === 'PK');

  } catch (error) {
    console.log(error);
  }
})

const tableHeaders = [
  {id: 0, text: 'PrfArt'}, 
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
  {id: 2, text: 'Studienleistungen'},
  {id: 3, text: 'PK'}
]

const selectedOption = ref(selectOptions[1].text);

// Computed Property zur Filterung der Daten basierend auf der Auswahl
const filteredScores = computed(() => {
  switch (selectedOption.value) {
    case 'Modulprüfungen':
      return mpScores.value;
    case 'Studienleistungen':
      return slScores.value;
    case 'PK':
      return pkScores.value;
    default:
      return scores.value; // Alle Einträge anzeigen
  }
});
</script>

<style scoped>
ion-grid {
  margin-bottom: 20px;
}
.score-row h4, .score-row h5 {
  font-size: 15px;
  display: inline-block;
  flex: 1;
  text-align: left;
  border: 1px solid yellow;
  margin: 0;
  width: 50px;
  
  white-space: normal;
  word-wrap: break-word;
 
}

.score-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
</style>