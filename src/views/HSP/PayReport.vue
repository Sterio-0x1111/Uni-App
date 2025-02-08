<template>
  <IonPage>
    <IonHeader>
      <toolbar-menu :menuTitle="toolbarTitle" iconName="cash" />
    </IonHeader>

    <IonContent :fullscreen="true">
      <!-- Benutzerdefiniertes Ladeoverlay -->
      <loadingOverlay :isLoading="loading" />

      <!-- Fehleranzeige -->
      <div v-if="error">
        <IonText color="danger">
          <p>{{ error }}</p>
        </IonText>
      </div>

      <!-- Hauptinhalt, nur anzeigen wenn Daten geladen sind -->
      <div v-if="data && !loading && !error" class="ion-padding">
        <!-- Statischer Einführungstext -->
        <div>
          <p>
            Wenn Sie Ihr Studium nach Ablauf des aktuellen Semesters fortsetzen wollen, müssen Sie sich innerhalb der
            jeweiligen Rückmeldefristen durch Zahlung des unter "Offene Zahlungen" angegebenen Betrages rückmelden.
          </p>
          <p>
            Überweisen Sie den Rechnungsbetrag für das Rückmeldesemester an die FH Südwestfalen:
          </p>

          <!-- Dynamisches IonCard mit Details -->
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Zahlung an</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonGrid>
                <IonRow>
                  <IonCol size="4"><strong>IBAN:</strong></IonCol>
                  <IonCol size="8">{{ data.iban }}</IonCol>
                </IonRow>
                <IonRow>
                  <IonCol size="4"><strong>BIC:</strong></IonCol>
                  <IonCol size="8">{{ data.bic }}</IonCol>
                </IonRow>
                <IonRow>
                  <IonCol size="4"><strong>Kreditinstitut:</strong></IonCol>
                  <IonCol size="8">{{ data.kreditinstitut }}</IonCol>
                </IonRow>
                <IonRow>
                  <IonCol size="12"><strong>Details:</strong></IonCol>
                  <IonCol size="12">{{ data.content }}</IonCol>
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </IonCard>

          <p>
            Bitte nutzen Sie ausschließlich die oben angegebene Bankverbindung und geben Sie unbedingt die Kennung
            bestehend aus (Matrikelnummer Nachname,Vorname) als Verwendungszweck an (in der ersten Zeile, ohne weitere
            Vor- und Zusätze). Überweisungen ohne diese Kennung können wir nicht bearbeiten.
          </p>
          <p>
            Nach Buchung Ihrer Zahlung können Sie die Studienbescheinigung und die Bescheinigung nach §9 BAföG für das
            kommende Semester ausdrucken.
          </p>
          <p>
            Als Zweithörer/in reichen Sie innerhalb der Rückmeldefrist zusätzlich eine Studienbescheinigung Ihrer
            Ersthochschule für das kommende Semester beim Studierenden-Servicebüro ein.
          </p>
          <p>
            <strong>Wichtig:</strong> Eine Rückmeldung ist erst möglich, wenn die Nachweise zur Aufhebung evtl.
            vorhandener Rückmeldesperren eingereicht wurden. Bitte setzen Sie sich ggf. mit dem Studierenden-Servicebüro
            in Verbindung.
          </p>
        </div>

        <!-- Offene Zahlungen -->
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Offene Zahlungen</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonGrid>
              <IonRow class="table-header">
                <IonCol size="3"><strong>Zeitraum</strong></IonCol>
                <IonCol size="5"><strong>Verwendungszweck</strong></IonCol>
                <IonCol size="2"><strong>Soll</strong></IonCol>
                <IonCol size="2"><strong>Ist</strong></IonCol>
              </IonRow>
              <IonRow v-for="(payment, index) in data.offeneZahlungen" :key="index" class="table-row">
                <IonCol size="3">{{ payment.Zeitraum }}</IonCol>
                <IonCol size="5">{{ payment.Verwendungszweck }}</IonCol>
                <IonCol size="2">{{ payment.Soll }}</IonCol>
                <IonCol size="2">{{ payment.Ist }}</IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>

        <!-- Geleistete Zahlungen -->
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Geleistete Zahlungen</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonGrid>
              <IonRow class="table-header">
                <IonCol size="3"><strong>Zeitraum</strong></IonCol>
                <IonCol size="5"><strong>Verwendungszweck</strong></IonCol>
                <IonCol size="2"><strong>Soll</strong></IonCol>
                <IonCol size="2"><strong>Ist</strong></IonCol>
              </IonRow>
              <IonRow v-for="(payment, index) in data.geleisteteZahlungen" :key="index" class="table-row">
                <IonCol size="3">{{ payment.Zeitraum }}</IonCol>
                <IonCol size="5">{{ payment.Verwendungszweck }}</IonCol>
                <IonCol size="2">{{ payment.Soll }}</IonCol>
                <IonCol size="2">{{ payment.Ist }}</IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { ref } from '@vue/reactivity';
import { onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import { IonPage, IonHeader, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol, IonText } from '@ionic/vue';
import loadingOverlay from '../LoadingOverlay.vue';
import toolbarMenu from "../ToolbarMenu.vue";

const loading = ref<boolean>(true);
const error = ref<string | null>(null);
const data = ref<any>(null);
const toolbarTitle = 'Rückmeldung';

// Methode zum Laden der Zahlungen
const loadPayments = async () => {
  try {
    loading.value = true; // Start des Ladezustands

    // Paralleler Abruf beider Endpunkte
    const [payReportResponse, scrapePaymentsResponse] = await Promise.all([
      axios.get("http://localhost:3000/api/hsp/payReport", { withCredentials: true }),
      axios.get("http://localhost:3000/api/hsp/scrapePayments", { withCredentials: true }),
    ]);

    // Daten aus beiden Endpunkten werden kombiniert
    data.value = {
      ...payReportResponse.data,
      ...scrapePaymentsResponse.data.data, // Anpassung je nach Struktur
    };
  } catch (err: any) {
    error.value = "Fehler beim Laden der Zahlungen: " + err.message;
  } finally {
    loading.value = false; // Ende des Ladezustands
  }
};

// Beim Mounten die Daten laden
onMounted(() => {
  loadPayments();
});

// Beim Unmounten sicherstellen, dass der Ladezustand beendet wird
onUnmounted(() => {
  loading.value = false;
});
</script>

<style scoped>
/* Mobile optimierte Tabellen */
.ion-grid {
  overflow-x: auto;
}

.table-header {
  background-color: #f0f0f0;
  font-weight: bold;
}

.table-row:nth-child(even) {
  background-color: #fafafa;
}

.table-row:hover {
  background-color: #f1f1f1;
}

/* Fehleranzeige Stil */
.error-message {
  padding: 16px;
  text-align: center;
}

@media (max-width: 600px) {
  .table-header IonCol,
  .table-row IonCol {
    padding: 8px;
    font-size: 14px;
  }

  .table-header {
    display: flex;
  }

  .table-row {
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
    border-bottom: 1px solid #ddd;
  }

  .table-row IonCol {
    width: 100%;
  }
}
</style>