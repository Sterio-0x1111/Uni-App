<template>
  <IonPage>
    <!-- Header -->
    <IonHeader>
      <toolbarMenu :menuTitle="toolbarTitle" iconName="newspaper" />
    </IonHeader>

    <!-- Content -->
    <IonContent>
      <custom-toggle v-model="showSelection" />

      <!-- Sender-Select -->
      <ion-item v-if="showSelection">
        <ion-label>Wähle einen Sender</ion-label>
        <ion-select v-model="selectedSender" @ionChange="filterMessages" placeholder="Sender wählen">
          <ion-select-option value="all">Alle</ion-select-option>
          <ion-select-option v-for="sender in uniqueSenders" :key="sender" :value="sender">
            {{ sender }}
          </ion-select-option>
        </ion-select>
      </ion-item>

      <!-- Alle oder ungelesene Nachrichten -->
      <ion-item v-if="showSelection">
        <ion-label>Nur ungelesene Nachrichten</ion-label>
        <ion-select v-model="onlyUnread" @ionChange="filterMessages" placeholder="Alle oder nur ungelesene">
          <ion-select-option value="all">Alle</ion-select-option>
          <ion-select-option value="unread">Nur ungelesene</ion-select-option>
        </ion-select>
      </ion-item>

      <!-- Pull-to-refresh -->
      <IonRefresher slot="fixed" @ionRefresh="doRefresh">
        <IonRefresherContent />
      </IonRefresher>

      <loadingOverlay :isLoading="loading" />

      <!-- Liste der Nachrichten -->
      <IonList>
        <IonItem v-for="message in filteredMessages" :key="message.msgID" :class="{ 'new-message': message.isUnread }"
          button detail @click="openMessage(message)">
          <IonLabel class="message-label">
            <h2>{{ message.subject }}</h2>
            <p>{{ message.preview }}</p>
            <p class="message-size">Größe: {{ message.size }}</p>
          </IonLabel>
          <IonNote slot="end" class="note-info">
            <div>{{ message.dateTime }}</div>
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
import { IonContent, IonPage, IonHeader, IonRefresher, IonRefresherContent, IonList, IonItem, IonLabel, IonNote, IonSelect, IonSelectOption,  } from '@ionic/vue'
import toolbarMenu from '../ToolbarMenu.vue'
import loadingOverlay from '../LoadingOverlay.vue'
import customToggle from '../VSC/CustomToggle.vue'
import axios from 'axios'

const toolbarTitle = 'Nachrichten'
const messages = ref([])
const filteredMessages = ref([])
const uniqueSenders = ref([])
const selectedSender = ref('all')
const onlyUnread = ref('all')
const router = useRouter()
const loading = ref(false)
const showSelection = ref(true)

const loadMessages = async () => {
  try {
    loading.value = true
    const response = await axios.get('http://localhost:3000/api/vpis/news', { withCredentials: true })
    messages.value = response.data.messages
    // Extrahiert alle einzigartigen Sender
    uniqueSenders.value = [...new Set(messages.value.map(message => message.sender))]
    filterMessages() // Filtert Nachrichten nach dem initialen Laden
  } catch (error) {
    console.error('Fehler beim Laden der Nachrichten:', error)
  } finally {
    loading.value = false
  }
}

const filterMessages = () => {
  // Filtert Nachrichten basierend auf dem ausgewählten Sender und dem ungelesen-Status
  filteredMessages.value = messages.value.filter(message => {
    const senderMatch = selectedSender.value === 'all' || message.sender === selectedSender.value
    const unreadMatch = onlyUnread.value === 'all' || (onlyUnread.value === 'unread' && message.isUnread)
    return senderMatch && unreadMatch
  })
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
  font-size: 1.1em;
  background-color: #e0f7fa;
  border-left: 4px solid #00796b;
  padding-left: 12px;
}

/* Styling für das Datum und Neu-Label im Note-Bereich */
.note-info {
  text-align: right;
  font-size: 0.8em;
}

/* Neu-Label unter dem Datum, visuell hervorgehoben */
.new-label {
  display: inline-block;
  background-color: #ffcc00;
  color: #000;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75em;
  margin-top: 4px;
}
</style>