<template>
  <ion-page>
    <ion-header>
      <toolbar-menu :menuTitle="toolbarTitle" iconName="login" />
    </ion-header>

    <ion-content>
      <loadingOverlay :isLoading="loading" :message="'Login...'" />

      <ion-card>
        <ion-card-header>
          <ion-card-title>Anmeldung</ion-card-title>
        </ion-card-header>

        <ion-card-content>
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <ion-item>
            <ion-label position="stacked">Username</ion-label>
            <ion-input v-model="username" type="text" required></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Password</ion-label>
            <ion-input v-model="password" type="password" required></ion-input>
          </ion-item>

          <ion-button class="custom-button" expand="block" @click="handleLogin">
            Anmelden
          </ion-button>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import axios from 'axios';
import { IonPage, IonHeader, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonButton } from '@ionic/vue';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import ToolbarMenu from './ToolbarMenu.vue';
import loadingOverlay from './LoadingOverlay.vue';

const toolbarTitle = "Login";
const authStore = useAuthStore();
const router = useRouter();

const username = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref<string | null>(null);

const handleLogin = async () => {
  errorMessage.value = null;
  
  if (!username.value || !password.value) {
    errorMessage.value = 'Bitte füllen Sie alle Felder aus.';
    return;
  }

  try {
    loading.value = true;
    const login = await authStore.centralLogin(username.value, password.value);

    if (login) {
      alert('Sie sind jetzt eingeloggt!');
      router.push('/navigation');
    } else {
      alert('Login fehlgeschlagen.');
      errorMessage.value = 'Falscher Benutzername oder falsches Passwort.';
    }
  } catch (error) {
    console.log('Fehler beim Login.', error);
    errorMessage.value = 'Ein Fehler ist aufgetreten oder Falscher Benutzername / falsches Passwort. Bitte versuchen Sie es später erneut.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
ion-item {
  margin-bottom: 20px;
}

/* Styling für die Fehlermeldung */
.error-message {
  color: red;
  margin-bottom: 10px;
  text-align: center;
  font-weight: bold;
}
</style>
