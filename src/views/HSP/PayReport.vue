<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Zahlungen</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true">
      <IonLoading :isOpen="loading" message="Lade Daten..." />

      <div v-if="error">
        <IonText color="danger">
          <p>{{ error }}</p>
        </IonText>
      </div>

      <IonList v-if="data">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Offene Zahlungen</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonGrid>
              <IonRow>
                <IonCol><strong>Zeitraum</strong></IonCol>
                <IonCol><strong>Verwendungszweck</strong></IonCol>
                <IonCol><strong>Soll</strong></IonCol>
                <IonCol><strong>Ist</strong></IonCol>
              </IonRow>
              <IonRow v-for="(payment, index) in data.offeneZahlungen" :key="index">
                <IonCol>{{ payment.Zeitraum }}</IonCol>
                <IonCol>{{ payment.Verwendungszweck }}</IonCol>
                <IonCol>{{ payment.Soll }}</IonCol>
                <IonCol>{{ payment.Ist }}</IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Geleistete Zahlungen</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonGrid>
              <IonRow>
                <IonCol><strong>Zeitraum</strong></IonCol>
                <IonCol><strong>Verwendungszweck</strong></IonCol>
                <IonCol><strong>Soll</strong></IonCol>
                <IonCol><strong>Ist</strong></IonCol>
              </IonRow>
              <IonRow v-for="(payment, index) in data.geleisteteZahlungen" :key="index">
                <IonCol>{{ payment.Zeitraum }}</IonCol>
                <IonCol>{{ payment.Verwendungszweck }}</IonCol>
                <IonCol>{{ payment.Soll }}</IonCol>
                <IonCol>{{ payment.Ist }}</IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Details</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>{{ data.details }}</p>
          </IonCardContent>
        </IonCard>
      </IonList>
    </IonContent>
  </IonPage>
</template>

<script>
import axios from "axios";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonLoading,
} from "@ionic/vue";

export default {
  name: "Payments",
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonText,
    IonLoading,
  },
  data() {
    return {
      loading: true,
      error: null,
      data: null,
    };
  },
  methods: {
    async loadPayments() {
      try {
        const response = await axios.get("http://localhost:3000/api/hsp/payReport", { withCredentials: true });
        this.data = response.data;
      } catch (err) {
        this.error = "Fehler beim Laden der Zahlungen: " + err.message;
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    this.loadPayments();
  },
};
</script>

<style scoped>
/* Mobile optimierte Tabellen */
.ion-grid {
  overflow-x: auto;
}

.ion-col {
  white-space: nowrap;
}
</style>