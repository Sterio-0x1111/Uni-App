<template>
  <div>
    <h1>Login Test</h1>
    <form @submit.prevent="handleLogin">
      <div>
        <label for="username">Benutzername:</label>
        <input type="text" id="username" v-model="username" required />
      </div>
      <div>
        <label for="password">Passwort:</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <button type="submit">Login</button>
    </form>
    <p v-if="statusMessage" :class="{ success: isSuccess, error: !isSuccess }">
      {{ statusMessage }}
    </p>
  </div>
</template>

<script>
import axios from 'axios';
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';

export default {
  name: 'Test',
  setup() {
    const username = ref('');
    const password = ref('');
    const statusMessage = ref('');
    const isSuccess = ref(false);
    
    const authStore = useAuthStore();
    const router = useRouter();

    const handleLogin = async () => {
      const url = 'http://localhost:3000/api/vpis/login';
      try {
        const response = await axios.post(
          url,
          { username: username.value, password: password.value },
          { withCredentials: true }
        );
        if (response.status === 200 && response.data) {
          isSuccess.value = true;
          statusMessage.value = 'Login erfolgreich: ' + response.data.message;

          await authStore.getStates();
          // router.push('/payReport');
        } else {
          throw new Error('Unerwartete Serverantwort');
        }
      } catch (error) {
        isSuccess.value = false;
        if (error.response) {
          statusMessage.value = 'Login fehlgeschlagen: ' + (error.response.data?.message || 'Fehlerhafte Serverantwort');
        } else if (error.request) {
          statusMessage.value = 'Login fehlgeschlagen: Keine Antwort vom Server.';
        } else {
          statusMessage.value = 'Login fehlgeschlagen: ' + error.message;
        }
      }
    };

    return {
      username,
      password,
      statusMessage,
      isSuccess,
      handleLogin
    };
  }
};
</script>

<style scoped>
.success {
  color: green;
}
.error {
  color: red;
}
</style>