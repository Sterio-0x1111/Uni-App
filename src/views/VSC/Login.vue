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
                    <ion-card-title>Navigation</ion-card-title>
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
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import { useAuthStore } from '@/stores/authStore';
import { useCourseStore } from '@/stores/courseStore';

const router = useRouter();
const username = ref(null);
const password = ref(null);
const url = 'http://localhost:3000/api/vsc/login';
const authStore = useAuthStore();

const handleLogin = async () => {
    try {

        const vscLogin = await axios.post(url, { username: username.value, password: password.value }, { withCredentials: true });
        
        if(vscLogin.status === 200){
            authStore.login();
            const courseStore = useCourseStore();
            console.log('Login: ', authStore.isLoggedIn);
            await courseStore.fetchCourses();
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