<template>
    <ion-page>
        <ion-header>
            <!--
            <ion-toolbar>
                <ion-title>Semesterzeiten</ion-title>
            </ion-toolbar>
            -->
            <ToolbarMenu />
        </ion-header>

        <ion-content>
            <div class="feedback" v-if="feedbackDates">
                <h2>{{ feedbackDates.headline }}</h2>
                <h3>{{ feedbackDates.nextSemester }}</h3>
                <h4>{{ feedbackDates.nextDate }}</h4>
                <p>
                    Rückmeldung: Loggen Sie sich in das Online-Portal ein und überweisen Sie den angegebenen Betrag. Achten Sie auf mögliche Rückmeldesperren. Sie erhalten eine E-Mail an Ihre FH Südwestfalen-Adresse (nachname.vorname@fh-swf.de) zum Starttermin der Rückmeldung.
                </p>

                <p>
                    Aktuelle Anschrift: Stellen Sie sicher, dass Ihre Adresse immer aktuell ist, damit wichtige Schreiben Sie erreichen. Änderungen können online, telefonisch, per E-Mail oder Post mitgeteilt werden.
                </p>
                
            </div>
            <hr />
            <ion-grid v-if="semesterPeriods">
                <ion-row>
                    <ion-col><strong>Semester</strong></ion-col>
                    <ion-col><strong>Zeitraum</strong></ion-col>
                </ion-row>
                <ion-row v-for="sem in semesterPeriods.table" :key="sem.semester">
                    <ion-col> <ion-text class="ion-text-small"> {{ sem.semester }} </ion-text></ion-col>
                    <ion-col><ion-text> {{ sem.period }} </ion-text></ion-col>
                    
                </ion-row>
            </ion-grid>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { IonPage, IonHeader, IonContent, IonToolbar, IonTitle, IonGrid, IonRow, IonCol, IonText } from '@ionic/vue';
import ToolbarMenu from './ToolbarMenu.vue';

const semesterPeriods = ref(null);
const feedbackDates = ref(null);

onMounted(async () => {
    getSemesterDates();
    getFeedbackInformation();
})

const getSemesterDates = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/semester/dates');
        const data = await response.json();
        semesterPeriods.value = data;
    } catch(error){
        console.error('Fehler beim Laden der Semesterdaten.', error);
    }
}

const getFeedbackInformation = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/semester/feedback');
        const data =await response.json();
        feedbackDates.value = data;

    } catch(error){
        console.log('Fehler beim Laden der Rückmeldedaten.', error);
    }
}
</script>

<style scoped>
.feedback {
    font-size: 20px;
}

p {
    margin-left: 10px;
    margin-right: 10px;
}
</style>