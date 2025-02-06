<template>
    <!-- ion-toggle -->

    <ion-grid class="score-grid">
        <ion-row> <!-- Tabellenheader -->
            <ion-col class="header-row score-row" size="5" size-sm="6" size-md="4" size-lg="4"><h4 class="cell">{{ headers[0].text }}</h4></ion-col>
            <ion-col class="header-row score-row" size="3" size-sm="3" size-md="4" size-lg="4"><h4 class="cell">{{ headers[1].text }}</h4></ion-col>
            <ion-col class="header-row score-row" size="4" size-sm="3" size-md="4" size-lg="4"><h4 class="cell">{{ headers[2].text }}</h4></ion-col>
        </ion-row>

        <ion-row v-for="exam in data" :key="exam" @click="popup(exam)"> <!-- Tabelleninhalt -->
            <ion-col class="score-row" size="5" size-sm="6" size-md="4" size-lg="4"><span class="cell">{{ exam[ tableIndices[0] ] }}</span></ion-col>
            <ion-col class="score-row" size="3" size-sm="3" size-md="4" size-lg="4"><span class="cell">{{ exam[ tableIndices[1] ] }}</span></ion-col>
            <ion-col class="score-row" size="4" size-sm="3" size-md="4" size-lg="4"><span class="cell">{{ exam[ tableIndices[2] ] }}</span></ion-col>
            <ion-item-divider class="custom-divider"></ion-item-divider>
        </ion-row>
    </ion-grid>
    <!--
    <ScoreDetails :isOpen="isModalOpen" :data="selectedRowData" @close="isModalOpen = false"/>
    -->
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonButton, IonSelect, IonSelectOption, IonGrid, IonCol, IonRow, IonItemDivider, IonText, IonToggle } from "@ionic/vue";
import { ref } from 'vue';
import ScoreDetails from './ScoreDetails.vue';

console.log('Exam Tables');
const props = defineProps({
    headers: {
        type: Array, 
        required: true
    },
    data: {
        type: Array,
        required: true
    },
    tableIndices: {
        type: Array,
        required: true
    }, 
    popup: {
        type: Function,
        required: true
    }
})


//const isModalOpen = ref(false);
//const selectedRowData = ref({});

const showModal = (row : any[]) => {
  if (row[0] === "PK" && (row[3].includes(",") || row[3] === "")) {
    selectedRowData.value = {
      Art: row[0],
      Nr: row[1],
      Modul: row[2],
      Note: row[3],
      Status: row[4],
      Anerkannt: row[5],
      ECTS: row[6],
      Freivermerk: row[7],
    };
  } else {
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
    };
  }

  // Optional: Modus für das Schließen durch den Hintergrund anpassen
  //backdropDismiss.value = true; // Falls du das Modal beim Klicken auf den Hintergrund schließen willst
  isModalOpen.value = true;
};
</script>

<style scoped>

</style>