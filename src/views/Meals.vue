<template>
    <ion-page>
        <ion-header>
            <toolbar-menu :menuTitle="menuTitle" />
        </ion-header>

        <ion-content>
            <p class="info-text">Hier finden Sie die täglichen Speisepläne.</p>
            <p class="info-text" v-if="nextLocation">Nächste Mensa: {{ nextLocation }}</p>
            <p class="info-text" v-if="nextDistance > -1">Entfernung: {{ nextDistance }} km</p>
            

            <ion-item>
                <ion-select class="selection" v-model="selectedMensa" @ionChange="loadSelectionOptions" placeholder="Mensa auswählen">
                    <ion-select-option v-for="mensa in mensas" :key="mensa.id" :value="mensa.name">
                        {{ mensa.name }}
                    </ion-select-option>
                </ion-select>
            </ion-item>

            <ion-item v-if="dateSelection && dateSelection.length > 0">
                <ion-select class="selection" v-model="selectedDate" @ionChange="loadMensaPlan" placeholder="Datum auswählen">
                    <ion-select-option v-for="date in dateSelection" :key="date.optionValue" :value="date.optionValue">
                        {{ date.optionText }}
                    </ion-select-option>
                </ion-select>
            </ion-item>

            <div class="grid-container" v-if="mensaPlan">
                <h2>Menü</h2>
                <ion-grid class="meals-view">
                    <ion-row class="header-row">
                        <ion-col :size="2">
                            <span>Art</span>
                        </ion-col>
                        <ion-col :size="10">
                            <span>Gericht</span>
                        </ion-col>
                    </ion-row>
                    <ion-row v-for="meal in mensaPlan" :key="meal.title">
                        <ion-col class="icon" :size="2">
                            <img v-if="meal.categoryIcon" class="category-icon" :src="categoryIcons[meal.categoryIcon]" :alt="meal.categoryIcon" :title="meal.categoryIcon" :aria-label="meal.categoryIcon" />
                            <img v-if="meal.supplyIcon" class="category-icon" :src="categoryIcons[meal.supplyIcon]" :alt="meal.supplyIcon" :title="meal.supplyIcon" :aria-label="meal.supplyIcon" />
                        </ion-col>
                        <ion-col :size="10">
                            <span>{{ meal.title }}</span>
                            <p v-if="meal.title !== 'Beiwerke'">{{ meal.priceStudent }} | {{ meal.priceEmployee }} | {{ meal.priceGuest }}</p>
                        </ion-col>
                        <ion-item-divider class="custom-divider" />
                    </ion-row>
                </ion-grid>
            </div>
            <div v-else>
                <p class="info-text">Mensa auswählen oder kein Plan gefunden.</p>
            </div>
            <ion-loading :is-open="loading" :message="loadingMessage"></ion-loading>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonItem, IonSelect, IonSelectOption, IonGrid, IonRow, IonCol, IonItemDivider, IonLoading } from '@ionic/vue';
import ToolbarMenu from "./ToolbarMenu.vue";
import { useLocationStore } from '@/stores/locationStore';

const menuTitle = ref('Mensaplan');

// Liste der Mensas mit ihren jeweiligen URLs
const mensas = [
    { id: 1, name: "Hagen", url: "https://www.stwdo.de/mensa-cafes-und-catering/fh-suedwestfalen/hagen" },
    { id: 2, name: "Iserlohn", url: "https://www.stwdo.de/mensa-cafes-und-catering/fh-suedwestfalen/iserlohn" },
    { id: 3, name: "Meschede", url: "https://www.stwdo.de/mensa-cafes-und-catering/fh-suedwestfalen/meschede" },
    { id: 4, name: "Soest", url: "https://www.stwdo.de/mensa-cafes-und-catering/fh-suedwestfalen/soest" }
]

const iconBaseURL = '/assets/icons'
const categoryIcons = { 
    'Tagesgericht':                     iconBaseURL + '/icon-tagesgericht.png',
    'Aktionsteller':                     iconBaseURL + '/icon-aktionsteller.png',
    'Menü 1':                           iconBaseURL + '/icon-menue-1.png',
    'Menü 2':                           iconBaseURL + '/icon-menue-2.png',
    'Klimateller':                      iconBaseURL + '/icon-bite.png',
    'Vegetarisches Menü':               iconBaseURL + '/icon-veggie-menue.png',
    'Ohne Fleisch':                     iconBaseURL + '/icon-vegetarisch.png',
    'Vegane Speise':                    iconBaseURL + '/icon-vegan.png',
    'Mit Fisch bzw. Meeresfrüchten':    iconBaseURL + '/icon-fisch.png',
    'Mit Rindfleisch':                  iconBaseURL + '/icon-rind.png',
    'Mit Geflügel':                     iconBaseURL + '/icon-gefluegel.png',
    'Mit Schweinefleisch':              iconBaseURL + '/icon-schwein.png',
    'Beilagen':                         iconBaseURL + '/icon-beilagen.png', 
    'Fleisch aus artgerechter Haltung': iconBaseURL + 'icon-artgerechte-haltung.png'
}


// Reaktive Variablen
const selectedMensa = ref(null);
const mensaPlan = ref(null);
const selectedDate = ref(null);
const dateSelection = ref([]);

// Berechne den Namen der ausgewählten Mensa
const selectedMensaName = computed(() => {
    const mensa = mensas.find(m => m.name === selectedMensa.value)
    return mensa ? mensa.name : ''
})

const nextLocation = ref('');
const nextDistance = ref(-1);
const loading = ref(false);
const loadingMessage = ref('');

onMounted(async () => {
    const locationStore = useLocationStore();
    
    if(!locationStore.nextLocation){
        loadingMessage.value = 'Warten auf Standortermittlung...';
        loading.value = true;
        const success = await locationStore.locateClient();

        if(success){
            selectedMensa.value = locationStore.nextLocation;
            nextLocation.value = locationStore.nextLocation;
            nextDistance.value = Math.round( (locationStore.nextLocationDistance / 1000) * 100 ) / 100; // Umrechnung in km
            loading.value = false;
            await loadSelectionOptions();
            //loading.value = false;
        } else {
            loading.value = false;
        }
    } else {
        selectedMensa.value = locationStore.nextLocation;
        nextLocation.value = locationStore.nextLocation;
        nextDistance.value = Math.round( (locationStore.nextLocationDistance / 1000) * 100 ) / 100; // Umrechnung in km
        await loadSelectionOptions();
    }
})

// Lade den Mensaplan basierend auf der ausgewählten Mensa
const loadMensaPlan = async () => {
    loadingMessage.value = 'Lade Mensaplan...';
    const mensa = mensas.find(m => m.name === selectedMensa.value);
    //const mensa = selectedMensa.value.toLowerCase();

    if (mensa) {
        try {
            console.log('Lade Mensaplan für', mensa.name);
            const response = await axios.get(`http://localhost:3000/api/meals/${encodeURIComponent(mensa.name)}/${selectedDate.value}`);
            const meals = response.data;
            console.log(meals.value);
            mensaPlan.value = (meals && response.status === 200) ? meals.table : null;
        } catch (error) {
            console.log('Fehler beim Laden des Mensaplan:', error);
            mensaPlan.value = null;
        } finally {
            loading.value = false;
        }
    } 
    loading.value = false;
}

const loadSelectionOptions = async () => {
    loadingMessage.value = 'Lade verfügbare Daten...';
    //const mensaName = selectedMensaName.value.toLowerCase();
    const mensaName = selectedMensa.value;

    try {
        const response = await axios.get(`http://localhost:3000/api/mensa/options/${mensaName}`);
        const data = await response.data;
        
        // Speichere die Datumsauswahl-Optionen in der reaktiven Liste
        dateSelection.value = data.options;
        selectedDate.value = data.options[0].optionValue;
        await loadMensaPlan();
    } catch (error) {
        console.log('Fehler beim Laden der Optionen:', error);
        dateSelection.value = [];
    }
}
</script>

<style scoped>

h2, .info-text, .selection {
    margin-left: 20px;
    margin-right: 20px;
}

.selection {
    font-size: 28px;
    margin-bottom: 30px;
}

.meals-view{
    font-size: 20px;
}

.category-icon {
    width: 30px;
}

.icon {
    /*text-align: center;*/
    display: flex; 
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 20px;
}

.grid-container {
    margin-bottom: 20px;
    margin-right: 2px;
}
</style>