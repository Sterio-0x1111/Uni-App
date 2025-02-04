<template>
  <IonPage>
    <!-- Header -->
    <IonHeader>
      <toolbarMenu :menuTitle="toolbarTitle" iconName="newspaper" />
    </IonHeader>

    <!-- Content -->
    <IonContent>
      <!-- Pull-to-refresh -->
      <IonRefresher slot="fixed" @ionRefresh="doRefresh">
        <IonRefresherContent />
      </IonRefresher>

      <loadingOverlay :isLoading="loading" />

      <!-- Liste der Nachrichten -->
      <IonList>
        <IonItem v-for="message in messages" :key="message.msgID" :class="{ 'new-message': message.isUnread }" button
          detail @click="openMessage(message)">
          <IonLabel class="message-label">
            <h2>{{ message.subject }}</h2>
            <p>{{ message.preview }}</p>
            <!-- Anzeige der Dateigröße -->
            <p class="message-size">Größe: {{ message.size }}</p>
          </IonLabel>
          <IonNote slot="end" class="note-info">
            <div>{{ message.dateTime }}</div>
            <!-- Neu-Label unter dem Datum, falls die Nachricht ungelesen ist -->
            <div v-if="message.isUnread" class="new-label">Neu</div>
          </IonNote>
        </IonItem>
      </IonList>
    </IonContent>
  </IonPage>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { IonContent, IonPage, IonHeader, IonRefresher, IonRefresherContent, IonList, IonItem, IonLabel, IonNote } from '@ionic/vue'
import toolbarMenu from '../ToolbarMenu.vue'
import loadingOverlay from '../LoadingOverlay.vue'
import axios from 'axios'

const toolbarTitle = 'Nachrichten'
const messages = ref([])
const router = useRouter()
const loading = ref(false)

const loadMessages = async () => {
  try {
    loading.value = true
    const response = await axios.get('http://localhost:3000/api/vpis/news', { withCredentials: true })
    messages.value = response.data.messages
  } catch (error) {
    console.error('Fehler beim Laden der Nachrichten:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadMessages()
})

const doRefresh = async (event) => {
  await loadMessages()
  event.detail.complete()
}

const openMessage = (message) => {
  router.push({ name: 'MessageDetail', params: { msgID: message.msgID } })
}
</script>

<style scoped>
/* Standardstil für alle Nachrichten */
ion-item {
  --padding-start: 16px;
  --inner-padding-end: 16px;
}

/* Label-Styling, um lange Texte vollständig anzuzeigen */
.message-label h2,
.message-label p,
.message-size {
  white-space: normal;
  word-break: break-word;
}

/* Hervorhebung für ungelesene (neue) Nachrichten */
.new-message {
  font-weight: bold;
  font-size: 1.1em;              /* Erhöhte Schriftgröße */
  background-color: #e0f7fa;      /* Heller, auffälliger Hintergrund */
  border-left: 4px solid #00796b; /* Markanter Farbstreifen links */
  padding-left: 12px;             /* Etwas mehr Abstand zum linken Rand */
}

/* Styling für das Datum und Neu-Label im Note-Bereich */
.note-info {
  text-align: right;
  font-size: 0.8em;
}

/* Neu-Label unter dem Datum, visuell hervorgehoben */
.new-label {
  display: inline-block;
  background-color: #ffcc00; /* Auffälliger Hintergrund */
  color: #000;               /* Schwarzer Text */
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75em;
  margin-top: 4px;           /* Abstand zum Datum */
}
</style>