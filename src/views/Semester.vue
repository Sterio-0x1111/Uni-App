<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Semesterzeiten</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content>
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

    const semesterPeriods = ref(null);

    onMounted(async () => {
        try{
            const response = await fetch('http://localhost:3000/api/semester');
            const data = await response.json();
            semesterPeriods.value = data;
        } catch(error){
            console.error('Fehler beim Laden der Semesterdaten.', error);
        }
    })
</script>