<template>
    <ion-page>
        <ion-header>
            <ToolbarMenu :menuTitle="menuTitle" />
        </ion-header>

        <ion-content>
            <div class="feedback" v-if="feedbackDates">
                <h4>{{ feedbackDates.headline }}</h4>
                <ion-item-divider class="custom-divider" />
                <h5>{{ feedbackDates.nextSemester }}</h5>
                <h6>{{ feedbackDates.nextDate }}</h6>
            </div>
            <ion-item-divider class="custom-divider" />

            <ion-icon name="lock-open"></ion-icon>
            <ion-icon name="lock-closed"></ion-icon>
            <ion-icon name="compass"></ion-icon>

            <ion-grid class="semester-grid" v-if="semesterPeriods">
                <h4>Semesterzeiträume</h4>
                <ion-row class="header-row">
                    <ion-col :size="7" :size-sm="6" :size-md="6" :size-lg="6"><strong>Semester</strong></ion-col>
                    <ion-col :size="5" :size-sm="6" :size-md="6" :size-lg="6"><strong>Zeitraum</strong></ion-col>
                </ion-row>
                <ion-row class="semester-row" v-for="sem in semesterPeriods.table" :key="sem.semester">
                    <ion-col class="semester" :size="7" :size-sm="6" :size-md="6" :size-lg="6"><span>{{ sem.semester }}</span></ion-col>
                    <ion-col class="period" :size="5" :size-sm="6" :size-md="6" :size-lg="6"><span>{{ sem.period }}</span></ion-col>
                    <ion-item-divider class="custom-divider" />
                </ion-row>
            </ion-grid>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { IonPage, IonHeader, IonContent, IonToolbar, IonTitle, IonGrid, IonRow, IonCol, IonItemDivider, IonIcon } from '@ionic/vue';
import ToolbarMenu from './ToolbarMenu.vue';

const menuTitle = "Semesterzeiten";
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

import { addIcons } from 'ionicons'; 
import { lockOpen, lockClosed, school, library, time, alarm, hourglass, calendar, clipboard, document, bulb, restaurant, cafe, fastFood, checkmarkCircle, trophy, statsChart, location, map, compass, medal } from 'ionicons/icons'; 
addIcons({ 
  'lock-open': lockOpen,
  'lock-closed': lockClosed,
  'school': school,
  'library': library,
  'time': time,
  'alarm': alarm,
  'hourglass': hourglass,
  'calendar': calendar,
  'clipboard': clipboard,
  'document': document,
  'bulb': bulb, 
  'restaurant': restaurant, 
  'cafe': cafe,
  'fast-food': fastFood,
  'checkmark-circle': checkmarkCircle,
  'trophy': trophy,
  'stats-chart': statsChart,
  'map': map,
  'compass': compass,
  'location': location,
  'medal': medal,
});
</script>

<style scoped>
.feedback {
    margin-left: 10px; 
    margin-right: 10px;
    text-align: block;
    
}

.semester-row {
    text-align: center;
    font-size: 20px;
}


.header-row{
    text-align: center;
}

.semester-grid {
    margin-top: 20px;
    margin-bottom: 20px;
}
</style>