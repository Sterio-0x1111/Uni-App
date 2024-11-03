<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Prüfungspläne</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent>
      <!-- Auswahl des Fachbereichs -->
      <ion-item>
        <ion-label>Wähle einen Fachbereich</ion-label>
        <ion-select v-model="selectedDepartment" @ionChange="onDepartmentChange" placeholder="Fachbereich wählen">
          <ion-select-option value="informatik-naturwissenschaft">Informatik & Naturwissenschaft</ion-select-option>
          <ion-select-option value="maschinenbau">Maschinenbau</ion-select-option>
        </ion-select>
      </ion-item>

      <!-- Auswahl des Semesters -->
      <ion-item>
        <ion-label>Wähle ein Semester</ion-label>
        <ion-select v-model="selectedSemester" placeholder="Semester wählen">
          <ion-select-option v-for="semester in accessibleSemesters" :key="semester.title" :value="semester.title">
            {{ semester.title }}
          </ion-select-option>
        </ion-select>
      </ion-item>

      <!-- Auswahl des Studiengangs -->
      <ion-item>
        <ion-label>Wähle einen Studiengang</ion-label>
        <ion-select v-model="selectedStudiengang" placeholder="Studiengang wählen">
          <ion-select-option v-for="studiengang in praesenzStudiengaenge" :key="studiengang.name" :value="studiengang">
            {{ studiengang.name }}
          </ion-select-option>
        </ion-select>
      </ion-item>

      <!-- Button zum Abrufen des Prüfungsplans -->
      <ion-button :disabled="!selectedSemester || !selectedStudiengang || loading" expand="block"
        @click="fetchPruefungsplan">
        <span v-if="!loading">Prüfungsplan anzeigen</span>
        <ion-spinner v-else name="crescent"></ion-spinner>
      </ion-button>

      <!-- Fehlermeldung anzeigen -->
      <div v-if="error" class="error-message">{{ error }}</div>

      <!-- Tabelle zur Anzeige der Teilzeiträume (gesamter Standort) -->
      <IonGrid v-if="pruefungsplan?.teilzeitraeume && !loading">
        <h3>Prüfungsteilzeiträume (gesamter Standort)</h3>
        <IonRow class="header">
          <IonCol>Datum</IonCol>
          <IonCol>Fachbereich</IonCol>
          <IonCol>Extras</IonCol>
        </IonRow>
        <IonRow v-for="item in pruefungsplan.teilzeitraeume" :key="item.dateRange">
          <IonCol>{{ item.dateRange || 'N/A' }}</IonCol>
          <IonCol>{{ item.fachbereich || 'N/A' }}</IonCol>
          <IonCol>{{ item.details || 'N/A' }}</IonCol>
        </IonRow>
      </IonGrid>

      <!-- Tabelle zur Anzeige der Anmeldungsfristen (Antrag auf Zulassung zu Modulprüfungen) -->
      <IonGrid v-if="pruefungsplan?.anmeldungsfristen && !loading">
        <h3>Fristen zur Anmeldung (Antrag auf Zulassung) zu den Modulprüfungen</h3>
        <IonRow class="header">
          <IonCol>Anmeldezeitraum</IonCol>
          <IonCol>Links</IonCol>
          <IonCol>Info URL</IonCol>
        </IonRow>
        <IonRow v-for="item in pruefungsplan.anmeldungsfristen" :key="item.zeitraum">
          <IonCol>{{ item.zeitraum || 'N/A' }}</IonCol>
          <IonCol>
            <ul>
              <li v-for="anmeldung in item.anmeldungen" :key="anmeldung.name">
                <a :href="anmeldung.url" target="_blank">{{ anmeldung.name }}</a>
              </li>
            </ul>
          </IonCol>
          <IonCol><a :href="item.infoUrl" target="_blank">{{ item.infoUrl }}</a></IonCol>
        </IonRow>
      </IonGrid>

      <!-- Tabelle zur Anzeige der Prüfungstermine nach Prüfungsordnung und Abschluss -->
      <IonGrid v-if="pruefungsplan?.pruefungstermine && !loading">
        <h3>Prüfungstermine nach Prüfungsordnung</h3>
        <IonRow class="header">
          <IonCol>Abschluss</IonCol>
          <IonCol>Version</IonCol>
          <IonCol>Auslaufdatum</IonCol>
          <IonCol>Studienverlaufsplan</IonCol>
          <IonCol>Kalenderansicht</IonCol>
          <IonCol>Internet Kalender</IonCol>
        </IonRow>
        <IonRow v-for="item in pruefungsplan.pruefungstermine" :key="item.abschluss">
          <IonCol>{{ item.abschluss || 'N/A' }}</IonCol>
          <IonCol>{{ item.version || 'N/A' }}</IonCol>
          <IonCol>{{ item.auslaufdatum || 'N/A' }}</IonCol>
          <IonCol><a :href="item.studienverlaufsplan" target="_blank">Link</a></IonCol>
          <IonCol><a :href="item.kalenderansicht" target="_blank">Link</a></IonCol>
          <IonCol><a :href="item.internetKalender" target="_blank">Link</a></IonCol>
        </IonRow>
      </IonGrid>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonLabel, IonItem, IonSelect, IonSelectOption, IonButton, IonSpinner, IonGrid, IonRow, IonCol } from '@ionic/vue';

const accessibleSemesters = ref([]);
const praesenzStudiengaenge = ref([]);
const selectedDepartment = ref<string | null>(null);
const selectedSemester = ref<string | null>(null);
const selectedStudiengang = ref<any>(null);
const pruefungsplan = ref<any>(null);
const loading = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  await loadAccessibleSemesters();
});

const loadAccessibleSemesters = async () => {
  try {
    loading.value = true;
    const response = await axios.get('http://localhost:3000/api/vpis/semesters');
    accessibleSemesters.value = response.data.filter((semester: any) => semester.isAccessible);
  } catch (err) {
    error.value = "Fehler beim Laden der Semester";
  } finally {
    loading.value = false;
  }
};

const onDepartmentChange = async () => {
  praesenzStudiengaenge.value = [];
  selectedStudiengang.value = null;

  if (selectedDepartment.value) {
    await loadPraesenzStudiengaenge();
  }
};

const loadPraesenzStudiengaenge = async () => {
  try {
    loading.value = true;
    const response = await axios.get(`http://localhost:3000/api/pruefungsplaene/iserlohn/${selectedDepartment.value}`);
    praesenzStudiengaenge.value = response.data.praesenzStudiengaenge;
  } catch (err) {
    error.value = "Fehler beim Laden der Studiengänge";
  } finally {
    loading.value = false;
  }
};

const fetchPruefungsplan = async () => {
  if (!selectedSemester.value || !selectedStudiengang.value) return;

  const semester = selectedSemester.value.split('/')[0];
  const studiengangCode = selectedStudiengang.value.link.split('Studiengang=')[1].split('&')[0];

  try {
    loading.value = true;
    error.value = null;
    const response = await axios.get(`http://localhost:3000/api/pruefungsplaene/iserlohn/vpisIserlohnPruefungen`, {
      params: { semester, studiengangCode },
    });
    pruefungsplan.value = response.data;
  } catch (err) {
    error.value = "Fehler beim Abrufen des Prüfungsplans";
  } finally {
    loading.value = false;
  }
};
</script>

<style>
.error-message {
  color: red;
  margin-top: 10px;
}

.header {
  font-weight: bold;
  background-color: #f0f0f0;
}

IonGrid, IonRow, IonCol {
  padding: 5px;
}
</style>