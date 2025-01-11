<template>
  <ion-page>
    <ion-header>
      <toolbar-menu :menuTitle="toolbarTitle" />
    </ion-header>

    <ion-content>
      <CustomToggle v-model="showSelection" />
      <div class="select-container" v-if="showSelection">
        <h6>Abschluss</h6>
        <ion-select v-if="degrees" v-model="selectedDegree" :disabled="degrees.length <= 1">
          <ion-select-option v-for="degree in degrees" :key="degree">
            {{ degree }}
          </ion-select-option>
        </ion-select>

        <h6>Studiengang</h6>
        <ion-select v-if="currentCourses" v-model="selectedCourse" @ionChange="loadData" :disabled="currentCourses.length <= 1">
          <ion-select-option v-for="course in currentCourses" :key="course">
            {{ course }}
          </ion-select-option>
        </ion-select>
        
        <h6>Filter</h6>
        <ion-select v-if="scores" v-model="selectedOption">
          <ion-select-option v-for="option in selectOptions" :key="option.id" aria-placeholder="Filter auswählen">
            {{ option.text }}
          </ion-select-option>
        </ion-select>
        <p>Klicken Sie auf eine Prüfung, um mehr Details zu erhalten.</p>
      </div>
      
      <div v-if="false">
        <ion-grid class="score-grid">
          <ion-row>
            <!-- Table Headers -->
            <!--<ion-col class="score-row" v-for="header in limitedHeaders" :key="header.id" size="6" size-sm="6" size-md="4" size-lg="3">
              <h4>{{ header.text }}</h4>
            </ion-col>
            -->

            <ion-col class="score-row header-row" size="5" size-sm="6" size-md="4" size-lg="4">
              <h4 class="cell">{{ limitedHeaders[0].text }}</h4> <!-- Modulname -->
            </ion-col>

            <ion-col class="score-row header-row" size="3" size-sm="6" size-md="4" size-lg="4">
              <h4 class="cell">{{ limitedHeaders[1].text }}</h4><!-- Note -->
            </ion-col>

            <ion-col class="score-row header-row" size="4" size-sm="6" size-md="4" size-lg="4">
              <h4 class="cell">{{ limitedHeaders[2].text }}</h4> <!-- Datum -->
            </ion-col>
          </ion-row>

          <ion-row v-for="row in filteredScores" :key="row" @click="showModal(row)" >
            <!--
            <ion-col v-for="index in headerIndices" :key="index" class="score-row" :size="4" :size-md="6" size-lg="4">
              <h5>{{ row[index] }}</h5>
            </ion-col>
            -->
            <ion-col class="score-row" :size="5" :size-md="6" size-lg="4">
              
                <span>{{ row[ headerIndices[0] ] }}</span>
              
            </ion-col>

            <ion-col class="score-row" :size="3" :size-md="6" size-lg="4">
              
                <span>{{ row[ headerIndices[1] ] }}</span>
              
            </ion-col>

            <ion-col class="score-row" :size="4" :size-md="6" size-lg="4">
              
                <span>{{ row[ headerIndices[2] ] }}</span>
              
            </ion-col>

            <ion-item-divider class="custom-divider"></ion-item-divider>
          </ion-row>
        </ion-grid>
      </div>
      
      <div class="grid-container" v-if="filteredScores">
        <ExamTables :headers="limitedHeaders" :tableIndices="headerIndices" :data="filteredScores" :popup="showModal" />
      </div>

      <ScoreDetails :isOpen="isModalOpen" :data="selectedRowData" :backdropDismiss="backdropDismiss" @close="isModalOpen = false"/>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onBeforeMount } from "vue";
import { IonPage, IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonButton, IonSelect, IonSelectOption, IonGrid, IonCol, IonRow, IonItemDivider, IonToggle } from "@ionic/vue";
import axios from "axios";
import CustomToggle from "./CustomToggle.vue";
import ExamTables from "./ExamTables.vue";
import ScoreDetails from "./ScoreDetails.vue";
import ToolbarMenu from "../ToolbarMenu.vue";
import { useAuthStore } from "@/stores/authStore";
import { useCourseStore } from "@/stores/courseStore";
import { useExamStore } from "@/stores/examStore";
import { useRouter } from 'vue-router';

const showSelection = ref(true);

const degrees = ref([]);
const courses = ref([]);
const masterCourses = ref([]);
const selectedDegree = ref(null);
const selectedCourse = ref(null);

const currentCourses = computed(() => {
    switch(selectedDegree.value){
        case 'Abschluss BA Bachelor':
            return courses.value;
        case 'Abschluss MA Master':
            return masterCourses.value;
        default:
            return null;
    }
})
// TODO: Kurs Selektion aus RegisteredExams einbauen und Backend entsprechend anpassen

const toolbarTitle = "Notenspiegel";
const scores = ref([]);
const mpScores = ref([]);
const slScores = ref([]);
const pkScores = ref([]);
const isModalOpen = ref(false);
const selectedRowData = ref({});
const backdropDismiss = ref(true); // Dynamisch steuern, ob das Modal durch Klicken auf den Hintergrund geschlossen werden kann

const category = "Notenspiegel";
// TODO: Kurs Selektion
const degree = ref('Abschluss BA Bachelor');
const course = ref('');

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
  backdropDismiss.value = true; // Falls du das Modal beim Klicken auf den Hintergrund schließen willst
  isModalOpen.value = true;
};

onMounted(async () => {
  try {
    const courseStore = useCourseStore();
    const examStore = useExamStore();
  
    degrees.value = courseStore.degrees;
    selectedDegree.value = (degrees.value.length === 1) ? degrees.value[0] : degrees.value[1];
  
    courses.value = courseStore.bachelorCourses;
    selectedCourse.value = (courses.value.length > 0) ? courses.value[0] : null;
          
    //await loadData();
    scores.value = await examStore.loadData(category, selectedDegree.value, selectedCourse.value);
    mpScores.value = examStore.mpScores;
    slScores.value = examStore.slScores;
    pkScores.value = examStore.pkScores;
    
  } catch (error) {
    console.log(error);
  }
});

const loadData = async () => {
  try {
    const url = `http://localhost:3000/api/vsc/exams/${category}/${selectedDegree.value}/${selectedCourse.value}`;
    const response = await axios.get(url, { withCredentials: true });
    if (response.status !== 200) {
      throw new Error(`${response.status}`);
    }

    scores.value = response.data.data;

    mpScores.value = scores.value.filter((target : (string | number)[]) => target[0] === "MP");
    slScores.value = scores.value.filter((target : (string | number)[]) => target[0] === "SL");
    pkScores.value = scores.value.filter((target : (string | number)[]) => target[0] === "PK");

  } catch(error){
    console.log(error);
  }
}

const tableHeaders = [
  { id: 0, text: "PrfArt" },
  { id: 1, text: "Prüfungsnr." },
  { id: 2, text: "Prüfungstext" },
  { id: 3, text: "Semester" },
  { id: 4, text: "Note" },
  { id: 5, text: "Status" },
  { id: 6, text: "Anerkannt" },
  { id: 7, text: "ECTS" },
  { id: 8, text: "Freivermerk" },
  { id: 9, text: "Versuch" },
  { id: 10, text: "Prüfungsdatum" },
];

const limitedHeaders = computed(() => {
  switch (selectedOption.value) {
    case selectOptions[1].text:
      return [tableHeaders[2], tableHeaders[4], tableHeaders[10]];
    case selectOptions[2].text:
      return [tableHeaders[2], tableHeaders[3], tableHeaders[5]];
    case selectOptions[3].text:
      return [
        tableHeaders[2],
        tableHeaders[4],
        tableHeaders[5],
        tableHeaders[7],
      ];
    default:
      return [tableHeaders[0], tableHeaders[2], tableHeaders[5]];
  }
});

const headerIndices = computed(() => {
  const headers = [...tableHeaders];

  if (selectedOption.value === "PK") {
    headers.splice(3, 1);
  }

  const indices : number[] = [];
  limitedHeaders.value.forEach((element : any) => {
    indices.push(headers.indexOf(element));
  });
  return indices;
});

const selectOptions = [
  { id: 0, text: "Alle Einträge" },
  { id: 1, text: "Modulprüfungen" },
  { id: 2, text: "Studienleistungen" },
  { id: 3, text: "PK" },
];

const selectedOption = ref(selectOptions[1].text);

// Computed Property zur Filterung der Daten basierend auf der Auswahl
const filteredScores = computed(() => {
  switch (selectedOption.value) {
    case "Modulprüfungen":
      return mpScores.value;
    case "Studienleistungen":
      return slScores.value;
    case "PK":
      pkScores.value.forEach((element : (string | number)[]) => {
        const actualElement = (Array.isArray(element) ? element : Array.from(element));
        if (actualElement[0] === "PK" && (actualElement[3].includes("S") || actualElement[3].includes("W"))) {
          actualElement.splice(3, 1);
        }
      });
      return pkScores.value;
    default:
      return scores.value; // Alle Einträge anzeigen
  }
});

const limitedScores = computed(() => {
  switch (selectedOption.value) {
    case selectOptions[1].text:
      return [
        filteredScores.value[2],
        filteredScores.value[4],
        filteredScores.value[10],
      ];
    default:
      return [];
  }
});
</script>

<style scoped>
.custom-toggle {
  display: block;
  margin-right: 10px;
  margin-left: 10px;
}

/*.custom-toggle {
  position: fixed;
  bottom: 0px;
  left: 0px;
  right: 0px;
  background-color: black;
  z-index: 1000;
}*/
</style>