<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';

/*const handleBeforeUnload = async (event) => {
  const authStore = useAuthStore();
  await authStore.logout();
  event.preventDefault();
  //event.returnValue = ""; // Zeigt Warnung im Browser an
};

onMounted(() => {
  window.addEventListener("beforeunload", handleBeforeUnload);
});

onUnmounted(() => {
  window.removeEventListener("beforeunload", handleBeforeUnload);
});*/
</script>
