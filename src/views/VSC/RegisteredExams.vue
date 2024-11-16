<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Angemeldete Prüfungen</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <course-selection />
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
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol } from '@ionic/vue';
import { ref, onMounted } from 'vue';
import axios from 'axios';
import CourseSelection from './CourseSelection.vue';

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

const url = 'http://localhost:3000/api/vsc/exams/registered';
const exams = ref(null);
const found = ref(false);


onMounted(async () => {
    try {
        const response = await axios.get(url, { withCredentials: true });
        
        if(response.status !== 200){
            throw new Error(`${response.status}`);
        }

        exams.value = response.data;
        found.value = exams.value.found;
        console.log(exams.value);

    } catch(error){
        console.log('Fehler beim Laden der angemeldeten Prüfungen vom Server.', error);
    }
})

</script>

<style scoped>

</style>