<template>
    <ion-page>
        <ion-header>
            <toolbar-menu :menuTitle="toolbarTitle" />
        </ion-header>

        <ion-content>
            <div class="select-container">
                <h4>Angemeldete Prüfungen</h4>
                <h6>Abschluss</h6>
                <ion-select v-if="degrees" v-model="selectedDegree" :disabled="degrees.length <= 1">
                    <ion-select-option v-for="degree in degrees" :key="degree">
                        {{ degree }}
                    </ion-select-option>
                </ion-select>

                <h6>Studiengang</h6>
                <ion-select v-if="currentCourses" v-model="selectedCourse" @ionChange="loadData" :disabled="currentCourses.length <= 1">
                    <ion-select-option v-for="course in courses" :key="course">
                        {{ course }}
                    </ion-select-option>
                </ion-select>
                <p>Klicken Sie auf eine Prüfung, um mehr Details zu erhalten.</p>
            </div>
            
            <!-- <course-selection /> -->
            <ion-grid class="score-grid" v-if="found">
                <ion-row> <!-- table headers, aktuell noch hardkodiert, später parsen und mitschicken -->
                    <ion-col class="score-row header-row" size="6" size-sm="6" size-md="4" size-lg="4">
                        <h4 class="score-row">{{ limitedHeaders[0].text }}</h4>
                    </ion-col>

                    <ion-col class="score-row header-row" size="3" size-sm="3" size-md="4" size-lg="4">
                        <h4 class="score-row">{{ limitedHeaders[1].text }}</h4>
                    </ion-col>

                    <ion-col class="score-row header-row" size="3" size-sm="3" size-md="4" size-lg="4">
                        <h4 class="score-row">{{ limitedHeaders[2].text }}</h4>
                    </ion-col>
                </ion-row>

                <ion-row v-for="exam in exams.data" :key="exam" @click="showModal(exam)">
                    <ion-col class="score-row" size="6" size-sm="6" size-md="4" size-lg="4"><span class="score-row">{{ exam[1] }}</span></ion-col>
                    <ion-col class="score-row" size="3" size-sm="3" size-md="4" size-lg="4"><span class="score-row">{{ exam[2] }}</span></ion-col>
                    <ion-col class="score-row" size="3" size-sm="3" size-md="4" size-lg="4"><span class="score-row">{{ exam[5] }}</span></ion-col>
                    <ion-item-divider class="custom-divider"></ion-item-divider>
                </ion-row>
            </ion-grid>

            <p v-else>Keine Daten gefunden.</p>

            <ScoreDetails :isOpen="isModalOpen" :data="selectedRowData" @close="isModalOpen = false"/>

        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonSelect, IonSelectOption, IonItemDivider } from '@ionic/vue';
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useCourseStore } from '@/stores/courseStore';
import ToolbarMenu from '../ToolbarMenu.vue';
import { checkAuthentication } from '@/helpers/authGuard';
import ScoreDetails from "./ScoreDetails.vue";

const toolbarTitle = 'Meine Prüfungen'

const headers = [
    { id: 0, text: 'Prüfungsnr.' },
    { id: 1, text: 'Modul' },
    { id: 2, text: 'Zugelassen' },
    { id: 3, text: 'Vorbehalt.' },
    { id: 4, text: 'Freivermerk' },
    { id: 5, text: 'Versuch' },
    { id: 6, text: 'Prüfer/-in' },
    { id: 7, text: 'Semester' },
    { id: 8, text: 'Prüfungsdatum' }
]

const limitedHeaders = [headers[1], headers[2], headers[5]];

const exams = ref(null);
const found = ref(false);

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

onMounted(async () => {
    if (checkAuthentication()) {
        try {
            const courseStore = useCourseStore();
    
            degrees.value = courseStore.degrees;
            selectedDegree.value = (degrees.value.length === 1) ? degrees.value[0] : degrees.value[1];
    
            courses.value = courseStore.bachelorCourses;
            selectedCourse.value = (courses.value.length > 0) ? courses.value[0] : null;
            
            await loadData();
    
        } catch(error){
            console.log('Fehler beim Laden der angemeldeten Prüfungen vom Server.', error);
        }
    }
})

const loadData = async () => {
    try {
        const category = 'Info über angemeldete Prüfungen';
        const url = `http://localhost:3000/api/vsc/exams/${category}/${selectedDegree.value}/${selectedCourse.value}`;
        const response = await axios.get(url, { withCredentials: true });

        if(response.status !== 200){
            throw new Error(`${response.status}`);
        }

        exams.value = response.data;
        found.value = exams.value.found;

    } catch(error){
        console.log('Fehler beim Laden der angemeldeten Prüfungen.', error);
    }
}

const isModalOpen = ref(false);
const selectedRowData = ref(null);
const showModal = (row : any[]) => {
    selectedRowData.value = {
        'Prüfungsnr.':      row[0],
        'Prüfungstext':     row[1],
        zugelassen:         row[2],
        Vorbehalt:          row[3],
        Freivermerk:        row[4],
        Versuch:            row[5],
        'Prüfer/in':        row[6], 
        Semester:           row[7],
        'Prüfungsdatum':    row[8]
    }

    isModalOpen.value = true;
}

</script>

<style scoped>

</style>