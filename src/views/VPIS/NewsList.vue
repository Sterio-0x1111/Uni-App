<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Nachrichten</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Pull-to-Refresh -->
      <ion-refresher slot="fixed" @ionRefresh="refreshNews">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <!-- Nachrichtenliste -->
      <ion-list>
        <ion-item 
          v-for="message in messages" 
          :key="message.msgID" 
          :router-link="`/news/message/${message.msgID}`" 
          :router-options="{ push: true }"
          lines="full"
          :color="message.isUnread ? 'light' : 'medium'"
          class="message-item"
        >
          <!-- Optional: Sender-Icon hinzufügen -->
          <ion-icon 
            slot="start" 
            :name="getSenderIcon(message.sender)" 
            size="large" 
            class="sender-icon"
          ></ion-icon>

          <ion-label>
            <h2>{{ message.subject }}</h2>
            <p>{{ message.preview }}</p>
            <p class="message-meta">{{ message.sender }} - {{ formatDateTime(message.dateTime) }}</p>
          </ion-label>
          
          <!-- Badge für ungelesene Nachrichten -->
          <ion-badge slot="end" color="warning" v-if="message.isUnread">Neu</ion-badge>
        </ion-item>
      </ion-list>

      <!-- Ladeindikator -->
      <ion-spinner v-if="loading" name="crescent" class="ion-margin"></ion-spinner>

      <!-- Fehleranzeige -->
      <ion-text v-if="error">
        <p class="ion-padding text-center text-danger">{{ error }}</p>
      </ion-text>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import axios from 'axios';
import dayjs from 'dayjs';

interface Message {
  msgID: string | null;
  dateTime: string;
  sender: string;
  subject: string;
  size: string;
  preview: string;
  isUnread: boolean;
}

export default defineComponent({
  name: 'NewsList',
  setup() {
    const messages = ref<Message[]>([]);
    const loading = ref<boolean>(false);
    const error = ref<string>('');

    const fetchNews = async () => {
      loading.value = true;
      error.value = '';
      try {
        const response = await axios.get(`http://localhost:3000/api/vpis/news`);
        messages.value = response.data.messages;
      } catch (err) {
        console.error('Fehler beim Laden der Nachrichten:', err);
        error.value = 'Fehler beim Laden der Nachrichten.';
      } finally {
        loading.value = false;
      }
    };

    const refreshNews = (event: CustomEvent) => {
      fetchNews().then(() => {
        event.detail.complete();
      });
    };

    const formatDateTime = (dateTime: string): string => {
      return dayjs(dateTime, 'DD.MM.YYYY HH:mm').format('DD.MM.YYYY HH:mm');
    };

    const getSenderIcon = (sender: string): string => {
      // Hier können Sie Logik hinzufügen, um basierend auf dem Sender ein passendes Icon zurückzugeben
      const icons: Record<string, string> = {
        'Krone': 'mail',
        'Drölle': 'book',
        'Hühne': 'construct',
        'VPIS SYSTEM': 'settings',
        'Giefers, H.': 'person',
        // Fügen Sie weitere Sender und deren Icons hinzu
      };
      return icons[sender] || 'mail-unread'; // Standard-Icon
    };

    onMounted(() => {
      fetchNews();
    });

    return {
      messages,
      loading,
      error,
      refreshNews,
      formatDateTime,
      getSenderIcon,
    };
  },
});
</script>

<style scoped>
.text-danger {
  color: var(--ion-color-danger);
}
.message-meta {
  font-size: 0.9em;
  color: var(--ion-color-medium);
}
.message-item {
  --padding-start: 12px;
  --padding-end: 12px;
}
.sender-icon {
  color: var(--ion-color-primary);
}
ion-item {
  transition: background-color 0.3s;
}
ion-item:hover {
  background-color: var(--ion-color-light-shade);
}
</style>
