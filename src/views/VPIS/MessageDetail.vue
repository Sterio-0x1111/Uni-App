<template>
  <IonPage>
    <!-- Header: Zeige den Header nur, wenn keine Fehler vorliegen -->
    <IonHeader v-if="!errorMessage">
      <IonToolbar>
        <toolbarMenu :menuTitle="toolbarTitle" iconName="newspaper" />
        <IonButtons slot="start">
          <IonBackButton defaultHref="/news" />
        </IonButtons>
      </IonToolbar>
    </IonHeader>
    <!-- Fallback-Header, falls Fehler aufgetreten ist -->
    <IonHeader v-else>
      <toolbarMenu :menuTitle="toolbarTitle" iconName="newspaper" />
    </IonHeader>

    <IonContent class="ion-padding">
      <!-- Zeige Fehleranzeige, falls errorMessage gesetzt ist -->
      <div v-if="errorMessage" class="error-message">
        <p>{{ errorMessage }}</p>
      </div>
      
      <!-- Ladeanzeige, falls noch geladen wird und keine Fehlermeldung vorliegt -->
      <div v-else-if="loading" class="loading">
        <loadingOverlay :isLoading="loading" />
      </div>

      <!-- Detailansicht der Nachricht -->
      <div v-else-if="message">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>{{ message.subject }}</IonCardTitle>
            <IonCardSubtitle>{{ message.dateTime }}</IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            <p class="sender">Von: {{ message.sender }}</p>
            <!-- HTML-Inhalt der Nachricht -->
            <div class="message-content" v-html="formattedContent"></div>
          </IonCardContent>
        </IonCard>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent } from '@ionic/vue'
import { useRoute } from 'vue-router'
import toolbarMenu from '../ToolbarMenu.vue'
import loadingOverlay from '../LoadingOverlay.vue'
import axios from 'axios'

const toolbarTitle = 'Nachricht'
const route = useRoute()
const msgID = route.params.msgID

// Fehlernachricht (falls keine gültige ID oder Request-Fehler)
const errorMessage = ref(null)
const message = ref(null)
const loading = ref(false)

// Falls keine gültige msgID vorhanden ist, direkt einen Fehler anzeigen:
if (!msgID) {
  errorMessage.value = 'Es wurde keine gültige Nachrichten-ID übergeben.'
}

const loadMessageDetail = async () => {
  if (!msgID) return

  try {
    loading.value = true
    const response = await axios.get(`http://localhost:3000/api/vpis/news/message/${msgID}`, { withCredentials: true })
    
    if (!response.data || Object.keys(response.data).length === 0) {
      errorMessage.value = 'Keine Nachricht mit dieser ID gefunden.'
    } else {
      if (response.data.messageContent && response.data.messageContent.includes('Sie waren nicht Empfänger dieser Nachricht')) {
        errorMessage.value = 'Sie waren nicht Empfänger dieser Nachricht.'
      } else {
        message.value = response.data
      }
    }
  } catch (error) {
    errorMessage.value = 'Fehler beim Laden der Nachricht. Bitte versuche es später erneut.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadMessageDetail()
})

const formattedContent = computed(() => {
  return message.value ? message.value.messageContent : ''
})
</script>

<style scoped>
/* Stil für den Absender */
.sender {
  font-weight: bold;
  margin-bottom: 10px;
}

/* Stil für den Nachrichtentext */
.message-content {
  line-height: 1.5;
}

/* Zentrierte Ladeanzeige */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

/* Fehleranzeige stilisieren */
.error-message {
  color: red;
  font-weight: bold;
  text-align: center;
  margin-top: 20px;
}

/* IonCard-Rand und Abstand für bessere mobile Darstellung */
ion-card {
  margin: 10px;
}
</style>