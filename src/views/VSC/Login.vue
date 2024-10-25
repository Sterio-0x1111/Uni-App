<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Login</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <ion-card>
                <ion-card-header>
                    <ion-card-title>Login</ion-card-title>
                </ion-card-header>

                <ion-card-content>
                    <ion-item>
                        <ion-label position="stacked">Username</ion-label>
                        <ion-input v-model="username" type="text" required></ion-input>
                    </ion-item>

                    <ion-item>
                        <ion-label position="stacked">Password</ion-label>
                        <ion-input v-model="password" type="password" required></ion-input>
                    </ion-item>

                    <ion-button expand="block" @click="handleLogin" >Anmelden</ion-button>
                </ion-card-content>
            </ion-card>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonButton } from '@ionic/vue';
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const username = ref(null);
const password = ref(null);

const handleLogin = async () => {
    try {

        const vscLogin = await axios.post('http://localhost:3000/api/vsc/login', { username: username.value, password: password.value }, { withCredentials: true });
        //const vscLogin = await axios.post('http://localhost:3000/api/vsc/login', { username: 'emkoc003', password: 'k9tX3ssP' }, { withCredentials: true });
    
        if(vscLogin.status === 200){
            router.push('/exams');
        }

    } catch(error){
        console.log('Fehler beim Login.', error);
    }
}
</script>

<style scoped>
ion-item {
    --highlight-heighth: 20px;
    margin-bottom: 20px;
}
</style>