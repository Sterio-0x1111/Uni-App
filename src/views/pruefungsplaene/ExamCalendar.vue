<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Wochenplan</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <!-- Navigation: Zurück / Weiter -->
            <ion-row class="header-nav ion-justify-content-between ion-align-items-center">
                <ion-col size="3">
                    <ion-button :disabled="loading" @click="previousWeek" fill="outline">Zurück</ion-button>
                </ion-col>
                <ion-col size="6" class="ion-text-center">
                    <h2>{{ formatDate(weekDates[0]) }} - {{ formatDate(weekDates[6]) }}</h2>
                </ion-col>
                <ion-col size="3" class="ion-text-right">
                    <ion-button :disabled="loading" @click="nextWeek" fill="outline">Weiter</ion-button>
                </ion-col>
            </ion-row>

            <!-- Kopfzeile (Wochentage) -->
            <ion-row class="header-row">
                <!-- Linke Spalte: Kopfcellle Zeit -->
                <ion-col size="0.8" class="time-label-col center-col">
                    <ion-button :disabled="loading" @click="goToToday" fill="outline">
                        <span v-if="!loading">Aktuelle Woche</span>
                        <ion-spinner v-else name="crescent"></ion-spinner>
                    </ion-button>
                </ion-col>
                <ion-col v-for="(day, index) in weekDates" :key="index" :class="{'active-day': isToday(day)}">
                    <div class="day-header">
                        <strong>{{ dayNames[index] }}</strong>
                        <div>{{ formatDate(day) }}</div>
                    </div>
                </ion-col>
            </ion-row>

            <!-- Uhrzeit -->
            <ion-row v-for="(time, idx) in allTimesOfWeek" :key="idx" class="time-row">
                <!-- Linke Spalte: Die Uhrzeit -->
                <ion-col size="0.8" class="time-label-col">
                    <div class="time-text">{{ time }}</div>
                </ion-col>

                <!-- Pro Tag eine Zelle → welche Events beginnen um diese Uhrzeit? -->
                <ion-col v-for="(day, index) in weekDates" :key="index">
                    <!-- Hole alle Events, die GENAU um "time" starten (bzw. wenn du - willst, könnte man Zeitbereiche parsen) -->
                    <div v-for="event in eventsByDayAndTime[ formatISODate(day) ]?.[time] || []" :key="event.id"
                        class="event-item">
                        <!-- Zeige alle Infos an, ohne Abschneiden -->
                        <strong>{{ event.title }}</strong>
                        <div class="event-details">
                            <p>Uhrzeit: {{ event.time }}</p>
                            <p>Raum: {{ event.rooms }}</p>
                            <p>Dozent: {{ event.dozent }}</p>
                            <p>Erstprüfer: {{ event.erstPruefer }}</p>
                            <p v-if="event.additionalInfos.length">
                                Infos:
                                <span v-for="(info, i2) in event.additionalInfos" :key="i2">
                                    {{ info }}
                                    <span v-if="i2 < event.additionalInfos.length - 1">, </span>
                                </span>
                            </p>
                        </div>
                    </div>
                </ion-col>
            </ion-row>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonRow,
  IonCol,
  IonButton
} from '@ionic/vue';
import axios from 'axios';

// Hilfsfunktionen für Datums- und Zeitberechnungen
function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const [d, m, y] = dateStr.split('.').map(Number);
  return new Date(y, m - 1, d);
}

function formatDateLocal(dateObj: Date): string {
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const yy = dateObj.getFullYear();
  return `${dd}.${mm}.${yy}`;
}

function formatISODate(dateObj: Date): string {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - (day === 0 ? 6 : day - 1);
  return new Date(date.setDate(diff));
}

function addDays(date: Date, days: number): Date {
  const r = new Date(date);
  r.setDate(r.getDate() + days);
  return r;
}

function parseTime(str: string): string {
  if (str.includes('-')) {
    return str.split('-')[0].replace('Uhr', '').trim();
  }
  return str.replace('Uhr', '').trim();
}

function timeToMinutes(hhmm: string): number {
  const [hh, mm] = hhmm.split(':');
  return parseInt(hh, 10) * 60 + parseInt(mm, 10);
}

const dataMeschede = ref<any[]>([]);
const dataHagen = ref<any[]>([]);
const currentWeekStart = ref(getMonday(new Date()));
const loading = ref(false);

const weekDates = computed(() => {
  const arr = [];
  for (let i = 0; i < 7; i++) {
    arr.push(addDays(currentWeekStart.value, i));
  }
  return arr;
});

const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

// Verarbeitet die Event-Daten aus verschiedenen Quellen
const events = computed(() => {
  const list: any[] = [];

  dataMeschede.value.forEach(item => {
    if (item.examSessions?.length) {
      item.examSessions.forEach((s: any) => {
        list.push({
          id: `${item.examNumber}-${s.date}`,
          title: item.title,
          date: s.date,
          time: s.time,
          rooms: s.rooms,
          dozent: item.dozent || '',
          erstPruefer: item.erstPruefer || '',
          additionalInfos: item.additionalInfos || []
        });
      });
    }
  });

  // Verarbeitung der Meschede-Daten
  dataHagen.value.forEach(item => {
    let date = item.termin;
    let time = '';
    if (item.termin.includes(',')) {
      const parts = item.termin.split(',');
      date = parts[0].trim().split('(')[0];
      time = parts[1].replace(/[–-]/, '-').trim();
    }
    list.push({
      id: item.pos,
      title: item.modul,
      date,
      time,
      rooms: item.raeume,
      dozent: item.pruefer,
      erstPruefer: item.pruefer,
      additionalInfos: []
    });
  });

  return list.filter(e => e.date && e.time);
});

// Gruppiert Events nach Datum und Zeit für die wöchentliche Darstellung
const eventsByDayAndTime = computed(() => {
  const result: Record<string, Record<string, any[]>> = {};
  events.value.forEach(ev => {
    const dt = parseDate(ev.date);
    if (dt >= currentWeekStart.value && dt <= addDays(currentWeekStart.value, 6)) {
      const iso = formatISODate(dt);
      if (!result[iso]) {
        result[iso] = {};
      }
      const startStr = parseTime(ev.time);
      if (!result[iso][startStr]) {
        result[iso][startStr] = [];
      }
      result[iso][startStr].push(ev);
    }
  });
  return result;
});

// Generiert eine Liste aller vorkommenden Zeiten in der Woche, sortiert nach Uhrzeit
const allTimesOfWeek = computed(() => {
  const timesSet = new Set<string>();
  Object.keys(eventsByDayAndTime.value).forEach(iso => {
    Object.keys(eventsByDayAndTime.value[iso]).forEach(t => {
      timesSet.add(t);
    });
  });
  const arr = Array.from(timesSet);
  arr.sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
  return arr;
});

const previousWeek = () => {
  currentWeekStart.value = addDays(currentWeekStart.value, -7);
};

const nextWeek = () => {
  currentWeekStart.value = addDays(currentWeekStart.value, 7);
};

// Formatierungsfunktion für Datumsanzeige
const formatDate = (d: Date) => formatDateLocal(d);

// Prüft, ob ein gegebenes Datum mit dem aktuellen Datum übereinstimmt
const isToday = (day: Date) => {
  const now = new Date();
  return (
    day.getFullYear() === now.getFullYear() &&
    day.getMonth() === now.getMonth() &&
    day.getDate() === now.getDate()
  );
};

// Setzt die Ansicht auf die aktuelle Woche
const goToToday = () => {
  currentWeekStart.value = getMonday(new Date());
};

onMounted(async () => {
  try {
    loading.value = true;
    const respMeschede = await axios.get(
      'http://localhost:3000/api/pruefungsplaene/meschede/ingenieur-wirtschaftswissenschaften'
    );
    dataMeschede.value = respMeschede.data;
  } catch (e) {
    console.error("Meschede error:", e);
  }
  try {
    const respHagen = await axios.get(
      'http://localhost:3000/api/pruefungsplaene/hagen/technische-betriebswirtschaft?url=https://obelix.fh-swf.de/pryfis/pryfung/pruefung/list/?bezeichnung=&pruefer=&pruefart=&semester=8&pruefungs_form=&start__gte=&start__lte=&regelsemester=&per_page=100'
    );
    dataHagen.value = respHagen.data;
  } catch (e) {
    console.error("Hagen error:", e);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
:root {
  --ion-background-color: #121212;
  --ion-text-color: #ffffff;
}
ion-page, ion-content, body {
  background-color: var(--ion-background-color);
  color: var(--ion-text-color);
}

ion-header, ion-toolbar {
  --background: #1f1f1f;
  --color: #ffffff;
}

ion-button {
  --border-color: #267aff;
  --color: #267aff;
  --background: transparent;
}
ion-button:hover {
  background-color: #333333;
}

.header-nav {
  margin-bottom: 1em;
}
.header-nav h2 {
  color: #ffffff;
}

.time-label-col {
  background-color: #1f1f1f;
  font-weight: bold;
  border-right: 1px solid #267aff;
}
.time-text {
  padding: 0.5em;
  border-bottom: 1px solid #333333;
}

.day-header {
  background-color: #1f1f1f;
  border-bottom: 1px solid #267aff;
  text-align: center;
  padding: 0.5em;
}
.active-day .day-header {
  border: 2px solid #267aff;
}

.time-row {
  border-top: 1px solid #333333;
}
.time-row:last-of-type {
  border-bottom: 1px solid #333333;
}

.time-row ion-col {
    padding: 0;
    margin: 0;
}

.event-item {
  margin: 0;
  padding: 0.5em;
  background-color: #2a2a2a;
  color: #ffffff;
  border: 1px solid #267aff;
  border-radius: 4px;
}

.header-row ion-col {
    padding: 0;
    margin: 0;
}

.event-details {
  margin-top: 0.5em;
  white-space: normal;
  overflow: visible;
}

.center-col {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
}
</style>