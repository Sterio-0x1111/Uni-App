<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Mensaplan</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <p>Hier finden Sie die täglichen Speisepläne.</p>
            <ion-item>
                <ion-select v-model="selectedMensa" @ionChange="loadSelectionOptions" placeholder="Mensa aussuchen">
                    <ion-select-option v-for="mensa in mensas" :key="mensa.id" :value="mensa.id">
                        {{ mensa.name }}
                    </ion-select-option>
                </ion-select>
            </ion-item>

            <ion-item v-if="dateSelection">
                <ion-select v-model="selectedDate" @ionChange="loadMensaPlan" placeholder="Mensa aussuchen">
                    <ion-select-option v-for="mensa in mensas" :key="mensa.id" :value="mensa.id">
                        {{ mensa.name }}
                    </ion-select-option>
                </ion-select>
            </ion-item>

            <div v-if="mensaPlan">
                    <h2>{{ selectedMensaName }}</h2>
                    <div v-for="meal in mensaPlan" :key="meal.title">
                        <p>{{ meal.title }}</p>
                        <span>{{ meal.priceStudent }} | {{ meal.priceEmployee }} | {{ meal.priceGuest }}</span>
                    </div>
                </div>
                <div v-else>
                    <p>Mensa auswählen oder kein Plan gefunden.</p>
                </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonItem, IonSelect, IonSelectOption } from '@ionic/vue';

// Liste der Mensas mit ihren jeweiligen URLs
const mensas = [
    { id: 1, name: "Hagen", url: "https://www.stwdo.de/mensa-cafes-und-catering/fh-suedwestfalen/hagen" },
    { id: 2, name: "Iserlohn", url: "https://www.stwdo.de/mensa-cafes-und-catering/fh-suedwestfalen/iserlohn" },
    { id: 3, name: "Meschede", url: "https://www.stwdo.de/mensa-cafes-und-catering/fh-suedwestfalen/meschede" },
    { id: 4, name: "Soest", url: "https://www.stwdo.de/mensa-cafes-und-catering/fh-suedwestfalen/soest" }
]

// Reaktive Variablen
const selectedMensa = ref(null)
const mensaPlan = ref(null)
const selectedDate = ref(null);
const dateSelection = ref(null);

// Berechne den Namen der ausgewählten Mensa
const selectedMensaName = computed(() => {
    const mensa = mensas.find(m => m.id === selectedMensa.value)
    return mensa ? mensa.name : ''
})

// Lade den Mensaplan basierend auf der ausgewählten Mensa
const loadMensaPlan = async () => {
    const mensa = mensas.find(m => m.id === selectedMensa.value)

    if (mensa) {
        try {
            console.log('Lade Mensaplan für', mensa.name)
            
            //const response = await fetch(`http://localhost:3000/api/meals/${mensa.name}`);
            const response = await fetch(`http://localhost:3000/api/meals/${encodeURIComponent(mensa.name)}`);
            /*const html = response.data
            const $ = cheerio.load(html)
            const meals = $('.meals').html()*/
            
            const meals = await response.json();
            console.log(meals);

            if (meals) {
                mensaPlan.value = meals.table;
            } else {
                mensaPlan.value = 'Kein Plan gefunden';
            }
        } catch (error) {
            console.log('Fehler beim Laden des Mensaplan:', error);
            mensaPlan.value = 'Fehler beim Laden des Mensaplan';
        }
    }
}

const loadSelectionOptions = async () => {
    dateSelection.value = await fetch('http://localhost:3000/api/')
}
</script>