<template>
  <IonPage>
    <IonHeader>
      <toolbar-menu :menuTitle="toolbarTitle" iconName="calendar" />
    </IonHeader>
    <IonContent>
      <custom-toggle v-model="showSelection" />

      <!-- Standort-Auswahl (Department/Standort der FH) -->
      <ion-item v-if="showSelection">
        <ion-label>Wähle einen Standort</ion-label>
        <ion-select v-model="selectedStandort" @ionChange="onStandortChange" placeholder="Standort wählen">
          <ion-select-option v-for="location in locations" :key="location" :value="location.toLowerCase()">
            {{ location }}
          </ion-select-option>
        </ion-select>
      </ion-item>

      <!-- Fachbereich-Auswahl -->
      <ion-item v-if="selectedStandort && showSelection">
        <ion-label>Wähle einen Fachbereich</ion-label>
        <ion-select v-model="selectedDepartment" @ionChange="onDepartmentChange" placeholder="Fachbereich wählen">
          <ion-select-option v-for="option in departmentOptions[selectedStandort]" :key="option.value"
            :value="option.value">
            {{ option.label }}
          </ion-select-option>
        </ion-select>
      </ion-item>

      <!-- Auswahl von Präsenz- und Verbundstudiengängen im gleichen Look -->
      <ion-item v-if="selectedStandort === 'iserlohn' && showSelection">
        <ion-label>Studiengang wählen</ion-label>
        <ion-select v-model="selectedStudiengang" @ionChange="onStudiengangChange" placeholder="Studiengang wählen">
          <ion-select-option disabled>--- Präsenzstudiengänge ---</ion-select-option>
          <ion-select-option v-for="sg in praesenzStudiengaenge" :key="sg.name" :value="sg">
            {{ sg.name }}
          </ion-select-option>

          <ion-select-option disabled>--- Verbundstudiengänge ---</ion-select-option>
          <ion-select-option v-for="sg in verbundStudiengaenge" :key="sg.name" :value="sg">
            {{ sg.name }}
          </ion-select-option>
        </ion-select>
      </ion-item>

      <!-- Auswahl des Semesters (wird nur angezeigt, wenn der Standort "iserlohn" ist) -->
      <ion-item
        v-if="selectedStandort === 'iserlohn' && showSelection && selectedStudiengang && selectedStudiengang.type === 'praesenz'">
        <ion-label>Wähle ein Semester</ion-label>
        <ion-select v-model="selectedSemester" placeholder="Semester wählen">
          <ion-select-option v-for="semester in accessibleSemesters" :key="semester.title" :value="semester.title">
            {{ semester.title }}
          </ion-select-option>
        </ion-select>
      </ion-item>

      <!-- Button zum Laden des Prüfungsplans -->
      <ion-button :disabled="isButtonDisabled" expand="block" @click="fetchPruefungsplan">
        <span v-if="!loading">Prüfungsplan anzeigen</span>
        <ion-spinner v-else name="crescent"></ion-spinner>
      </ion-button>

      <!-- Fehlermeldung -->
      <div v-if="error" class="error-message">{{ error }}</div>

      <!-- Anzeige der InfoBoxes und Prüfungspläne -->
      <template v-if="!loading && pruefungsplan && (
        (selectedStandort === 'hagen' && selectedDepartment === 'elektrotechnik-informationstechnik') ||
        (selectedStandort === 'soest' && selectedDepartment)
        )">
        <!-- InfoBoxes -->
        <IonGrid>
          <IonRow>
            <IonCol>
              <h2 v-if="pruefungsplan.infoBoxes">Informationen</h2>
            </IonCol>
          </IonRow>
          <IonRow v-for="(box, index) in pruefungsplan.infoBoxes" :key="index">
            <IonCol>
              <!-- Paragraph -->
              <p v-if="box.type === 'p'">{{ box.text }}</p>

              <!-- Div -->
              <div v-else-if="box.type === 'div'" v-html="box.text"></div>

              <!-- Unordered List -->
              <ul v-else-if="box.type === 'ul'">
                <li v-for="(item, idx) in parseListItems(box.text)" :key="idx">{{ item }}</li>
              </ul>

              <!-- Heading Level 3 -->
              <h3 v-else-if="box.type === 'h3'">{{ box.text }}</h3>

              <!-- Strong Text -->
              <strong v-else-if="box.type === 'strong'">{{ box.text }}</strong>

              <!-- Anchor Link -->
              <a v-else-if="box.type === 'a'" :href="box.href" target="_blank">{{ box.text }}</a>

              <!-- Default: Render as plain text if type is unrecognized -->
              <span v-else>{{ box.text }}</span>
            </IonCol>
          </IonRow>
        </IonGrid>

        <!-- Prüfungspläne in einer Tabelle -->
        <IonGrid v-if="!loading && pruefungsplan.plans && pruefungsplan.plans.length">
          <IonRow>
            <IonCol>
              <h2>Prüfungspläne</h2>
            </IonCol>
          </IonRow>
          <IonRow v-for="(planGroup, groupIndex) in pruefungsplan.plans" :key="groupIndex">
            <IonCol>
              <h3>{{ planGroup.title }}</h3>
              <table class="plans-table">
                <thead>
                  <tr>
                    <th>Plan Titel</th>
                    <th>Link</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(plan, planIndex) in planGroup.plans" :key="planIndex">
                    <td>{{ plan.title }}</td>
                    <td>
                      <a :href="plan.url" target="_blank">Öffnen</a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </IonCol>
          </IonRow>
        </IonGrid>
      </template>

      <!-- Tabellen zur Anzeige von Daten -->
      <IonGrid v-if="pruefungsplan?.teilzeitraeume && !loading && selectedStudiengang?.type === 'praesenz'">
        <h3>Prüfungsteilzeiträume (gesamter Standort)</h3>
        <IonRow class="header">
          <IonCol size="4" size-md="3" size-lg="2">Datum</IonCol>
          <IonCol size="4" size-md="3" size-lg="3">Fachbereich</IonCol>
          <IonCol size="4" size-md="3" size-lg="3">Extras</IonCol>
        </IonRow>
        <IonRow v-for="item in pruefungsplan.teilzeitraeume" :key="item.dateRange">
          <IonCol size="4" size-md="3" size-lg="2">{{ item.dateRange || 'N/A' }}</IonCol>
          <IonCol size="4" size-md="3" size-lg="3">{{ item.fachbereich || 'N/A' }}</IonCol>
          <IonCol size="4" size-md="3" size-lg="3">{{ item.details || 'N/A' }}</IonCol>
        </IonRow>
      </IonGrid>

      <!-- Tabelle zur Anzeige der Anmeldungsfristen -->
      <IonGrid v-if="pruefungsplan?.teilzeitraeume && !loading && selectedStudiengang?.type === 'praesenz'">
        <h3>Fristen zur Anmeldung (Antrag auf Zulassung) zu den Modulprüfungen</h3>
        <IonRow class="header">
          <IonCol size="4" size-md="3" size-lg="2">Anmeldezeitraum</IonCol>
          <IonCol size="4" size-md="3" size-lg="3">Links</IonCol>
          <IonCol size="4" size-md="3" size-lg="3">Info URL</IonCol>
        </IonRow>
        <IonRow v-for="item in pruefungsplan.anmeldungsfristen" :key="item.zeitraum">
          <IonCol size="4" size-md="3" size-lg="2">{{ item.zeitraum || 'N/A' }}</IonCol>
          <IonCol size="4" size-md="3" size-lg="3">
            <ul>
              <li v-for="anmeldung in item.anmeldungen" :key="anmeldung.name">
                <a :href="anmeldung.url" target="_blank">{{ anmeldung.name }}</a>
              </li>
            </ul>
          </IonCol>
          <IonCol size="4" size-md="3" size-lg="3"><a :href="item.infoUrl" target="_blank">{{ item.infoUrl }}</a>
          </IonCol>
        </IonRow>
      </IonGrid>

      <!-- Tabelle zur Anzeige der Prüfungstermine nach Prüfungsordnung und Abschluss -->
      <IonGrid v-if="pruefungsplan?.teilzeitraeume && !loading && selectedStudiengang?.type === 'praesenz'">
        <h3>Prüfungstermine nach Prüfungsordnung</h3>
        <IonRow class="header">
          <IonCol size="2" size-md="3" size-lg="2">Abschluss</IonCol>
          <IonCol size="2" size-md="3" size-lg="2">Version</IonCol>
          <IonCol size="2" size-md="3" size-lg="2">Auslaufdatum</IonCol>
          <IonCol size="3" size-md="3" size-lg="3">Studienverlaufsplan</IonCol>
          <IonCol size="3" size-md="3" size-lg="3">Kalenderansicht</IonCol>
        </IonRow>
        <IonRow v-for="item in pruefungsplan.pruefungstermine" :key="item.abschluss">
          <IonCol size="2" size-md="3" size-lg="2">{{ item.abschluss || 'N/A' }}</IonCol>
          <IonCol size="2" size-md="3" size-lg="2">{{ item.version || 'N/A' }}</IonCol>
          <IonCol size="2" size-md="3" size-lg="2">{{ item.auslaufdatum || 'N/A' }}</IonCol>
          <IonCol size="3" size-md="3" size-lg="3"><a :href="item.studienverlaufsplan" target="_blank">Link</a></IonCol>
          <IonCol size="3" size-md="3" size-lg="3"><a :href="item.kalenderansicht" target="_blank">Link</a></IonCol>
        </IonRow>
      </IonGrid>

      <IonGrid v-if="showVerbundDetails && selectedStudiengang && selectedStudiengang.type === 'verbund'">
        <IonRow>
          <IonCol>
            <!-- Name und Zusatzinfo -->
            <h2>{{ selectedStudiengang.name }}</h2>
            <p v-if="selectedStudiengang.additionalInfo">{{ selectedStudiengang.additionalInfo }}</p>
          </IonCol>
        </IonRow>

        <!-- Falls additionalLinks vorhanden sind -->
        <div v-if="selectedStudiengang.additionalLinks && selectedStudiengang.additionalLinks.length">
          <IonRow class="header">
            <IonCol size="8">Titel</IonCol>
            <IonCol size="4">Link</IonCol>
          </IonRow>
          <IonRow v-for="(linkItem, linkIndex) in selectedStudiengang.additionalLinks" :key="linkIndex">
            <IonCol size="8">{{ linkItem.name }}</IonCol>
            <IonCol size="4">
              <IonButton fill="outline" :href="linkItem.link" target="_blank">
                Zur PDF
              </IonButton>
            </IonCol>
          </IonRow>
        </div>

        <!-- Allgemeiner Link zum Studiengang -->
        <IonRow>
          <IonCol>
            <IonButton fill="clear" :href="selectedStudiengang.link" target="_blank">
              Mehr erfahren
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>

      <examCalendar v-if="showCalendar" :choice="calendarChoice" />
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { ref } from '@vue/reactivity';
import { computed } from 'vue';
import axios from 'axios';
import { IonContent, IonHeader, IonPage, IonLabel, IonItem, IonSelect, IonSelectOption, IonButton, IonSpinner, IonGrid, IonRow, IonCol } from '@ionic/vue';
import CustomToggle from '@vsc/CustomToggle.vue';
import examCalendar from './ExamCalendar.vue';
import ToolbarMenu from '../ToolbarMenu.vue';

// States
const selectedStandort = ref<string | null>(null);
const accessibleSemesters = ref([]);
const praesenzStudiengaenge = ref([]);
const verbundStudiengaenge = ref([]);
const showVerbundDetails = ref(false);
const selectedDepartment = ref<string | null>(null);
const selectedSemester = ref<string | null>(null);
const selectedStudiengang = ref<any>(null);
const pruefungsplan = ref<any>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const showSelection = ref(true);
const calendarChoice = ref<string | null>(null);
const showCalendar = ref(false);
const toolbarTitle = "Prüfungspläne"

// Standorte und Fachbereiche
const locations = ['Hagen', 'Iserlohn', 'Lüdenscheid', 'Meschede', 'Soest'];
const departmentOptions = {
  hagen: [
    { value: 'elektrotechnik-informationstechnik', label: 'Elektrotechnik & Informationstechnik' },
    { value: 'technische-betriebswirtschaft', label: 'Technische Betriebswirtschaft' }
  ],
  iserlohn: [
    { value: 'informatik-naturwissenschaft', label: 'Informatik & Naturwissenschaft' },
    { value: 'maschinenbau', label: 'Maschinenbau' }
  ],
  meschede: [
    { value: 'ingenieur-wirtschaftswissenschaften', label: 'Ingenieur-Wirtschaftswissenschaften' }
  ],
  soest: [
    { value: 'agrarwirtschaft', label: 'Agrarwirtschaft' },
    { value: 'bildungs-gesellschaftswissenschaften', label: 'Bildungs- und Gesellschaftswissenschaften' },
    { value: 'elektrische-energietechnik', label: 'Elektrische Energietechnik' },
    { value: 'maschinenbau-automatisierungstechnik', label: 'Maschinenbau-Automatisierungstechnik' }
  ]
};

// Funktionen
const onStandortChange = async () => {
  resetSelections();
  if (selectedStandort.value === 'iserlohn') await loadAccessibleSemesters();
};

const onDepartmentChange = async () => {
  resetStudiengaenge();
  if (selectedStandort.value === 'iserlohn') await loadStudiengaenge();
};

const onStudiengangChange = () => {
  if (!selectedStudiengang.value || selectedStudiengang.value.type !== 'verbund') showVerbundDetails.value = false;
};

const isButtonDisabled = computed(() => {
  if (loading.value) return true; // Deaktiviert, wenn Daten geladen werden
  if (!selectedStandort.value || !selectedDepartment.value) return true; // Pflichtfelder leer
  if (selectedStandort.value === 'iserlohn') {
    if (!selectedStudiengang.value) return true; // Studiengang erforderlich
    if (selectedStudiengang.value?.type === 'praesenz' && !selectedSemester.value) return true; // Semester erforderlich
  }
  return false;
});

/*
"loading || !selectedStandort || !selectedDepartment ||
// Falls kein Studiengang ausgewählt wurde und der Standort nicht in den Ausnahmebereichen ist:
(!selectedStudiengang && selectedStandort !== 'soest' && selectedStandort !== 'hagen') ||
// Spezialfall Iserlohn: Bei Präsenz-Studiengang ist zudem ein Semester erforderlich:
(selectedStandort === 'iserlohn' && selectedStudiengang && selectedStudiengang.type === 'praesenz' && !selectedSemester)"
*/

// Parsing-Funktion für Listen
const parseListItems = (text: string): string[] => {
  // Split by comma and trim whitespace
  return text.split(',').map(item => item.trim()).filter(item => item.length > 0);
};

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

const loadStudiengaenge = async () => {
  try {
    loading.value = true;
    const response = await axios.get(`http://localhost:3000/api/pruefungsplaene/iserlohn/${selectedDepartment.value}`);
    const { praesenzStudiengaenge: pStudien, verbundStudiengaenge: vStudien } = response.data;
    praesenzStudiengaenge.value = pStudien.map((sg: any) => ({ ...sg, type: 'praesenz' })); // präsenz
    verbundStudiengaenge.value = vStudien.map((sg: any) => ({ ...sg, type: 'verbund' })); // verbund
  } catch (err) {
    error.value = 'Fehler beim Laden der Studiengänge';
  } finally {
    loading.value = false;
  }
};

async function loadPruefungsplan() {
  try {
    loading.value = true;
    const response = await axios.get(`http://localhost:3000/api/pruefungsplaene/${selectedStandort.value}/${selectedDepartment.value}`);
    pruefungsplan.value = response.data;
  } catch (err) {
    error.value = "Fehler beim Laden des Prüfungsplans";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const fetchPruefungsplan = async () => {
  try {
    loading.value = true;
    error.value = null;
    pruefungsplan.value = null;
    calendarChoice.value = null;
    showVerbundDetails.value = false;
    showCalendar.value = false;

    // Falls ein Verbundstudiengang ausgewählt wurde, die Verbund-Details anzeigen
    if (selectedStudiengang.value && selectedStudiengang.value.type === 'verbund') {
      showVerbundDetails.value = true;
      return;
    } else if ((selectedStandort.value === 'hagen' && selectedDepartment.value === 'elektrotechnik-informationstechnik') || (selectedDepartment.value && selectedStandort.value === 'soest')) {
      return await loadPruefungsplan();
    } else if (selectedStudiengang.value) {
      // Präsenz-Variante
      const semester = selectedSemester.value.split('/')[0];
      const studiengangCode = selectedStudiengang.value.link.split('Studiengang=')[1].split('&')[0];

      const response = await axios.get(
        `http://localhost:3000/api/pruefungsplaene/iserlohn/vpisIserlohnPruefungen`,
        { params: { semester, studiengangCode } }
      );
      pruefungsplan.value = response.data;
    } else if ((selectedStandort.value === 'meschede' && selectedDepartment.value === 'ingenieur-wirtschaftswissenschaften') ||
    (selectedStandort.value === 'hagen' && selectedDepartment.value === 'technische-betriebswirtschaft')) {
      showCalendar.value = true;
      if (selectedDepartment.value === 'ingenieur-wirtschaftswissenschaften')
        calendarChoice.value = 'ingenieur-wirtschaftswissenschaften';
      else if (selectedDepartment.value === 'technische-betriebswirtschaft')
        calendarChoice.value = 'technische-betriebswirtschaft';
    }
  } catch (err) {
    error.value = "Fehler beim Abrufen des Prüfungsplans";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Hilfsfunktionen
const resetSelections = () => {
  selectedDepartment.value = null;
  selectedSemester.value = null;
  selectedStudiengang.value = null;
  praesenzStudiengaenge.value = [];
  verbundStudiengaenge.value = [];
  accessibleSemesters.value = [];
  showCalendar.value = false;
};

const resetStudiengaenge = () => {
  selectedStudiengang.value = null;
  praesenzStudiengaenge.value = [];
  verbundStudiengaenge.value = [];
  showCalendar.value = false;
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

.plans-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.plans-table th,
.plans-table td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}

.plans-table th {
  background-color: #f5f5f5;
}

/* Für kleinere Bildschirme */
@media (max-width: 767px) {
  IonCol {
    padding: 8px;
    font-size: 14px;
  }

  .header {
    font-size: 16px;
  }
}
</style>