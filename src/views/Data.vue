<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Hochschulportal Login</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <div v-if="!isLoggedIn">
                <ion-item>
                    <ion-label position="floating">Benutzername</ion-label>
                    <ion-input v-model="username" type="text" placeholder="Benutzername"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-label position="floating">Passwort</ion-label>
                    <ion-input v-model="password" type="password" placeholder="Passwort"></ion-input>
                </ion-item>
                <ion-button expand="block" @click="login">Login</ion-button>
                <ion-spinner v-if="loading"></ion-spinner>
            </div>

            <div v-else>
                <ion-title>Persönliche Daten</ion-title>
                <ion-list>
                    <ion-item v-for="(data, index) in personalData" :key="index">
                        <ion-label>{{ data }}</ion-label>
                    </ion-item>
                </ion-list>
            </div>

            <p v-if="errorMessage">{{ errorMessage }}</p>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { ref } from 'vue';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonSpinner, IonList } from '@ionic/vue';

const username = ref('');
const password = ref('');
const isLoggedIn = ref(false);
const personalData = ref([]);
const loading = ref(false);
const errorMessage = ref('');

const login = async () => {
    loading.value = true;
    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username.value, password: password.value })
        });

        if (response.ok) {
            isLoggedIn.value = true;
            const data = await response.json();
            personalData.value = data;
        } else {
            errorMessage.value = 'Login fehlgeschlagen. Überprüfen Sie Ihre Anmeldedaten.';
        }
    } catch (error) {
        console.error('Fehler beim Login:', error);
        errorMessage.value = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
    } finally {
        loading.value = false;
    }
};
</script>