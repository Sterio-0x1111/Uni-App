<template>
    <ion-page>
        <ion-header>
            <toolbar-menu :menuTitle="toolbarTitle" iconName="login" />
        </ion-header>

        <ion-content>
            <loadingOverlay :isLoading="loading" />
            <ion-card>
                <ion-card-header>
                    <ion-card-title>Anmeldung</ion-card-title>
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

                    <ion-button class="custom-button" expand="block" @click="handleLogin">Anmelden</ion-button>
                </ion-card-content>
            </ion-card>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import axios from 'axios';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonButton } from '@ionic/vue';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import { useAuthStore } from '@/stores/authStore';
import { checkAuthentication } from '@/helpers/authGuard';
import { useCourseStore } from '@/stores/courseStore';
import ToolbarMenu from './ToolbarMenu.vue';
import loadingOverlay from './LoadingOverlay.vue';

const toolbarTitle = "Login"
const authStore = useAuthStore();
const router = useRouter();
const username = ref(null);
const password = ref(null);
const loading = ref(false);

onMounted(() => {
    
});

const handleLogin = async () => {
    try {
        loading.value = true;
        const login = await authStore.centralLogin(username.value, password.value);

        if(login){
            console.log('Frontend Login erfolgreich!', login);
            alert('Sie sind jetzt eingeloggt!');
            await useCourseStore().fetchCourses();
            router.push('/navigation');
        } else {
            console.log('Frontend Login fehlgeschlagen.');
            alert('Login fehlgeschlagen.');
        }
    } catch(error){
        console.log('Fehler beim Login.', error);
    } finally {
        loading.value = false;
    }
}
</script>

<style scoped>
ion-item {
    --highlight-heighth: 20px;
    margin-bottom: 20px;
}
</style>