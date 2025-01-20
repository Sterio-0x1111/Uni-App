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
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';

export default {
  name: 'Test',
  data() {
    return {
      username: '',
      password: '',
      statusMessage: '',
      isSuccess: false
    };
  },
  setup() {
    const authStore = useAuthStore();
    const courseStore = useCourseStore();
    const router = useRouter();

    return { authStore, courseStore, router };
  },
  methods: {
    async handleLogin() {
      const url = 'http://localhost:3000/api/hsp/login';
      try {
        const response = await axios.post(
          url,
          { username: this.username, password: this.password },
          { withCredentials: true }
        );
        if (response.status === 200 && response.data) {
          this.isSuccess = true;
          this.statusMessage = 'Login erfolgreich: ' + response.data.message;

          await this.authStore.getStates();
          // await this.courseStore.fetchCourses();
          // this.router.push('/payReport');
        } else {
          throw new Error('Unerwartete Serverantwort');
        }
      } catch (error) {
        this.isSuccess = false;
        if (error.response) {
          this.statusMessage = 'Login fehlgeschlagen: ' + (error.response.data?.message || 'Fehlerhafte Serverantwort');
        } else if (error.request) {
          this.statusMessage = 'Login fehlgeschlagen: Keine Antwort vom Server.';
        } else {
          this.statusMessage = 'Login fehlgeschlagen: ' + error.message;
        }
      }
    }
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