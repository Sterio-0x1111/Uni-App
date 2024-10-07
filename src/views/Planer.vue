<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Fachbereiche und Kontakte</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <!-- Ladeanzeige -->
            <ion-spinner v-if="loading"></ion-spinner>
            <p v-if="errorMessage">{{ errorMessage }}</p>

            <!-- Fachbereiche Liste -->
            <ion-list v-if="departments.length > 0">
                <ion-item v-for="(department, index) in departments" :key="index">
                    <ion-label>
                        <h2>{{ department.title }}</h2>
                        <p>{{ department.location }}</p>
                    </ion-label>

                    <!-- Kontakt-Informationen für jeden Fachbereich -->
                    <ion-list v-if="department.contacts && department.contacts.length > 0">
                        <ion-item v-for="(contact, i) in department.contacts" :key="i">
                            <ion-label>
                                <h3 v-if="contact.name">{{ contact.name }}</h3>
                                <h3 v-else>Kontaktname nicht verfügbar</h3>
                                <a v-if="contact.link" :href="contact.link" target="_blank">Mehr Informationen</a>
                            </ion-label>
                        </ion-item>
                    </ion-list>
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-page>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonItem, IonLabel, IonList, IonSpinner } from '@ionic/vue';

const departments = ref([]);
const loading = ref(false);
const errorMessage = ref('');

// Funktion zum Abrufen der Fachbereiche und Kontaktinformationen
const fetchDepartments = async () => {
    loading.value = true;
    try {
        const response = await fetch('http://localhost:3000/api/vpisPlaner/planer');
        
        if (response.ok) {
            departments.value = await response.json();
            console.log(departments.value);
        } else {
            errorMessage.value = 'Fehler beim Abrufen der Daten.';
        }
    } catch (error) {
        errorMessage.value = 'Ein Fehler ist aufgetreten.';
        console.error('Fehler beim Abrufen der Fachbereiche:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(fetchDepartments);
</script>