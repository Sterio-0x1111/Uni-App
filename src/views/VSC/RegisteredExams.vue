<template>
    <ion-page>
        <ion-header>
            <toolbar-menu :menuTitle="toolbarTitle" />
        </ion-header>

        <ion-content>
            <ion-select v-if="degrees" v-model="selectedDegree" :disabled="degrees.length <= 1">
                <ion-select-option v-for="degree in degrees" :key="degree">
                    {{ degree }}
                </ion-select-option>
            </ion-select>

            <ion-select v-if="currentCourses" v-model="selectedCourse" @ionChange="loadData" :disabled="currentCourses.length <= 1">
                <ion-select-option v-for="course in courses" :key="course">
                    {{ course }}
                </ion-select-option>
            </ion-select>
            <!-- <course-selection /> -->
            <ion-grid v-if="found">
                <ion-row> <!-- table headers, aktuell noch hardkodiert, später parsen und mitschicken -->
                    <ion-col v-for="header in limitedHeaders" :key="header.id">
                        {{ header.text }}
                    </ion-col>
                </ion-row>

                <ion-row v-for="exam in exams.data" :key="exam">
                    <ion-col>{{ exam[1] }}</ion-col>
                    <ion-col>{{ exam[2] }}</ion-col>
                    <ion-col>{{ exam[5] }}</ion-col>
                    
                </ion-row>
            </ion-grid>

            <p v-else>Keine Daten gefunden.</p>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonSelect, IonSelectOption } from '@ionic/vue';
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useCourseStore } from '@/stores/courseStore';
import ToolbarMenu from '../ToolbarMenu.vue';
import { checkAuthentication } from '@/helpers/authGuard';

const toolbarTitle = 'Angemeldete Prüfungen'

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
            return courses;
        case 'Abschluss MA Master':
            return masterCourses;
        default:
            return null;
    }
})

console.log(currentCourses);
onMounted(async () => {
    if (checkAuthentication()) {
        try {
            const courseStore = useCourseStore();
            //await courseStore.fetchCourses();
    
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
        const url = `http://localhost:3000/api/vsc/exams/registered/${selectedDegree.value}/${selectedCourse.value}`;
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

</script>

<style scoped>

</style>