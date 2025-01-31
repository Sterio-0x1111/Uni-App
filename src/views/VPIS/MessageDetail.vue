<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/news"></ion-back-button>
        </ion-buttons>
        <ion-title>Nachricht</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Nachrichteninhalt -->
      <ion-card v-if="messageDetail">
        <ion-card-header>
          <ion-card-title>{{ messageDetail.subject }}</ion-card-title>
          <ion-card-subtitle>{{ messageDetail.sender }} - {{ formatDateTime(messageDetail.dateTime) }}</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <div v-html="sanitizedMessageContent"></div>
        </ion-card-content>
      </ion-card>

      <!-- Zusatzinformationen -->
      <ion-card v-if="messageDetail.fachbereich || messageDetail.modul || messageDetail.veranstaltung">
        <ion-list>
          <ion-item v-if="messageDetail.fachbereich">
            <ion-label>
              <strong>Fachbereich:</strong> {{ messageDetail.fachbereich }}
            </ion-label>
          </ion-item>
          <ion-item v-if="messageDetail.modul">
            <ion-label>
              <strong>Modul:</strong> {{ messageDetail.modul }}
            </ion-label>
          </ion-item>
          <ion-item v-if="messageDetail.veranstaltung">
            <ion-label>
              <strong>Veranstaltung:</strong> {{ messageDetail.veranstaltung }}
            </ion-label>
          </ion-item>
        </ion-list>
      </ion-card>

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
import { defineComponent, ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';
import DOMPurify from 'dompurify';

interface MessageDetail {
  subject: string;
  dateTime: string | null;
  sender: string | null;
  fachbereich: string | null;
  modul: string | null;
  veranstaltung: string | null;
  messageContent: string;
}

export default defineComponent({
  name: 'MessageDetail',
  setup() {
    const route = useRoute();
    const msgID = route.params.msgID as string;

    const messageDetail = ref<MessageDetail | null>(null);
    const loading = ref<boolean>(false);
    const error = ref<string>('');

    const fetchMessageDetail = async () => {
      loading.value = true;
      error.value = '';
      try {
          const response = await axios.get(`http://localhost:3000/api/vpis/news/message/${msgID}`);
        messageDetail.value = response.data;
      } catch (err) {
        console.error('Fehler beim Laden der Nachricht:', err);
        error.value = 'Fehler beim Laden der Nachricht.';
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      fetchMessageDetail();
    });

    const sanitizedMessageContent = computed(() => {
      return messageDetail.value ? DOMPurify.sanitize(messageDetail.value.messageContent) : '';
    });

    const formatDateTime = (dateTime: string | null): string => {
      if (!dateTime) return '';
      // Optional: Formatieren Sie das Datum nach Bedarf
      return dateTime;
    };

    return {
      messageDetail,
      loading,
      error,
      sanitizedMessageContent,
      formatDateTime,
    };
  },
});
</script>

<style scoped>
.text-danger {
  color: var(--ion-color-danger);
}
</style>