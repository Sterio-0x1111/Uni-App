<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>VPIS Login (Entwickler Test)</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <ion-item>
                <ion-label position="floating">Benutzername</ion-label>
                <ion-input v-model="username" type="text" placeholder="Benutzername"></ion-input>
            </ion-item>
            <ion-item>
                <ion-label position="floating">Passwort</ion-label>
                <ion-input v-model="password" type="password" placeholder="Passwort"></ion-input>
            </ion-item>
            <ion-item>
                <ion-label>Semester</ion-label>
                <ion-select v-model="selectedSemester" placeholder="Semester auswählen">
                    <ion-select-option v-for="semester in semesters" :key="semester.link" :value="semester.link">
                        {{ semester.title }} ({{ semester.startDate }} - {{ semester.endDate }})
                    </ion-select-option>
                </ion-select>
            </ion-item>
            <ion-button expand="block" @click="login">Login</ion-button>

            <ion-spinner v-if="loading"></ion-spinner>
            <p v-if="errorMessage">{{ errorMessage }}</p>
            <div v-if="personalData.length > 0">
                <ion-list>
                    <ion-item v-for="data in personalData" :key="data.id">
                        <ion-label>{{ data }}</ion-label>
                    </ion-item>
                </ion-list>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonSelect, IonSelectOption, IonSpinner, IonList } from '@ionic/vue';

const username = ref('');
const password = ref('');
const selectedSemester = ref(null);
const semesters = ref([]);
const personalData = ref([]);
const loading = ref(false);
const errorMessage = ref('');

// Funktion zum Abrufen der verfügbaren Semester
const fetchSemesters = async () => {
    loading.value = true;
    try {
        const response = await fetch('http://localhost:3000/api/vpis/semesters');
        if (response.ok) {
            semesters.value = await response.json();
        } else {
            errorMessage.value = 'Fehler beim Abrufen der Semester.';
        }
    } catch (error) {
        console.error('Fehler beim Abrufen der Semester:', error);
        errorMessage.value = 'Ein Fehler ist aufgetreten.';
    } finally {
        loading.value = false;
    }
};

// Lade die Semester beim Start
onMounted(fetchSemesters);

const login = async () => {
    loading.value = true;
    try {
        const response = await fetch('http://localhost:3000/api/vpisLogin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username.value,
                password: password.value,
                semester: selectedSemester.value
            })
        });

        if (response.ok) {
            const data = await response.json();
            personalData.value = data;
        } else {
            errorMessage.value = 'Login fehlgeschlagen.';
        }
    } catch (error) {
        errorMessage.value = 'Fehler beim Abrufen der Daten.';
    } finally {
        loading.value = false;
    }
};
</script>