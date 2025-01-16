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
                    <ion-button :disabled="loading" @click=" goToToday" fill="outline">
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

            <!-- Jetzt listen wir jede "relevante" Uhrzeit zeilenweise auf -->
            <ion-row v-for="(time, idx) in allTimesOfWeek" :key="idx" class="time-row">
                <!-- Linke Spalte: Die Uhrzeit -->
                <ion-col size="0.8" class="time-label-col">
                    <div class="time-text">{{ time }}</div>
                </ion-col>

                <!-- Pro Tag eine Zelle → welche Events beginnen um diese Uhrzeit? -->
                <ion-col v-for="(day, index) in weekDates" :key="index">
                    <!-- Hole alle Events, die GENAU um "time" starten (bzw. wenn du - 
               willst, könnte man Zeitbereiche parsen) -->
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

<script>
import { defineComponent, ref, computed, onMounted } from 'vue';
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

/* Hilfsfunktionen */
function parseDate(dateStr) {
  if (!dateStr) return new Date();
  const [d, m, y] = dateStr.split('.').map(Number);
  return new Date(y, m-1, d);
}
function formatDateLocal(dateObj) {
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const mm = String(dateObj.getMonth()+1).padStart(2, '0');
  const yy = dateObj.getFullYear();
  return `${dd}.${mm}.${yy}`;
}
function formatISODate(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay(); // So=0, Mo=1,...
  const diff = date.getDate() - (day === 0 ? 6 : day - 1);
  return new Date(date.setDate(diff));
}
function addDays(date, days) {
  const r = new Date(date);
  r.setDate(r.getDate() + days);
  return r;
}
// Zeitstrings parsen ("HH:MM" oder "HH:MM - HH:MM" → Start=... End=...?)
function parseTime(str) {
  // Falls Zeitbereich
  if (str.includes('-')) {
    // Nimm die Startzeit (oder beides)
    return str.split('-')[0].replace('Uhr','').trim();
  }
  return str.replace('Uhr','').trim();
}

/** Wandelt "10:30" in Minuten (z.B. 630) **/
function timeToMinutes(hhmm) {
  const [hh, mm] = hhmm.split(':');
  return parseInt(hh,10)*60 + parseInt(mm,10);
}

export default defineComponent({
  name: 'WochenplanDynamicTimes',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonRow,
    IonCol,
    IonButton
  },
  setup() {
    // Refs
    const dataMeschede = ref([]);
    const dataHagen = ref([]);
    const currentWeekStart = ref(getMonday(new Date()));
    const loading = ref(false);

    // Ermitteln der 7 Tage
    const weekDates = computed(() => {
      const arr = [];
      for (let i=0; i<7; i++) {
        arr.push(addDays(currentWeekStart.value, i));
      }
      return arr;
    });
    const dayNames = ['Mo','Di','Mi','Do','Fr','Sa','So'];

    // Alle Events in ein gemeinsames Array
    const events = computed(() => {
      const list = [];

      // Meschede
      dataMeschede.value.forEach(item => {
        if (item.examSessions?.length) {
          item.examSessions.forEach(s => {
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

      // Hagen
      dataHagen.value.forEach(item => {
        let date = item.termin;
        let time = '';
        if (item.termin.includes(',')) {
          const parts = item.termin.split(',');
          date = parts[0].trim().split('(')[0];
          time = parts[1].replace(/[–-]/,'-').trim();
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

      // Filtern
      return list.filter(e => e.date && e.time);
    });

    // Damit wir die Events pro Tag & Zeit ablegen, bauen wir ein "Dictionary of Dictionaries":
    // eventsByDayAndTime[isoDate][timeString] = [ array of events ... ]
    const eventsByDayAndTime = computed(() => {
      const result = {};
      // Nur Events für die aktuelle Woche
      events.value.forEach(ev => {
        const dt = parseDate(ev.date);
        // Prüfen, ob dt in [currentWeekStart, currentWeekStart+6]
        if (dt >= currentWeekStart.value && dt <= addDays(currentWeekStart.value,6)) {
          const iso = formatISODate(dt);
          if (!result[iso]) {
            result[iso] = {};
          }
          // Zeit (Start) extrahieren
          const startStr = parseTime(ev.time); // z.B. "10:30"
          if (!result[iso][startStr]) {
            result[iso][startStr] = [];
          }
          result[iso][startStr].push(ev);
        }
      });
      return result;
    });

    // Sammle ALLE Zeitstrings, die in eventsByDayAndTime erscheinen, sortiere sie
    // => So entsteht unsere dynamische Linksspalte
    const allTimesOfWeek = computed(() => {
      const timesSet = new Set();
      // Gehe durch alle Tage
      Object.keys(eventsByDayAndTime.value).forEach(iso => {
        // und dann durch alle Zeitstrings
        Object.keys(eventsByDayAndTime.value[iso]).forEach(t => {
          timesSet.add(t); 
        });
      });
      // Jetzt in ein Array wandeln und sortieren
      const arr = Array.from(timesSet);
      // Sort nach HH:MM
      arr.sort((a,b) => timeToMinutes(a) - timeToMinutes(b));
      return arr;
    });

    // Navigation
    const previousWeek = () => {
      currentWeekStart.value = addDays(currentWeekStart.value, -7);
    };
    const nextWeek = () => {
      currentWeekStart.value = addDays(currentWeekStart.value, 7);
    };

    // Format
    const formatDate = d => formatDateLocal(d);

    // isToday
    const isToday = (day) => {
      const now = new Date();
      return (
        day.getFullYear() === now.getFullYear() &&
        day.getMonth() === now.getMonth() &&
        day.getDate() === now.getDate()
      );
    };

    const goToToday = () => {
      currentWeekStart.value = getMonday(new Date());
    };

    // onMounted -> Daten laden
    onMounted(async() => {
      try {
        loading.value = true;
        const respMeschede = await axios.get(
          'http://localhost:3000/api/pruefungsplaene/meschede/ingenieur-wirtschaftswissenschaften'
        );
        dataMeschede.value = respMeschede.data;
      } catch(e) {
        console.error("Meschede error:", e);
      }
      try {
        const respHagen = await axios.get(
          'http://localhost:3000/api/pruefungsplaene/hagen/technische-betriebswirtschaft?url=https://obelix.fh-swf.de/pryfis/pryfung/pruefung/list/?bezeichnung=&pruefer=&pruefart=&semester=8&pruefungs_form=&start__gte=&start__lte=&regelsemester=&per_page=100'
        );
        dataHagen.value = respHagen.data;
      } catch(e) {
        console.error("Hagen error:", e);
      } finally {
        loading.value = false;
      }
    });

    return {
      dataMeschede,
      dataHagen,
      currentWeekStart,
      weekDates,
      dayNames,
      eventsByDayAndTime,
      allTimesOfWeek,
      loading,
      previousWeek,
      nextWeek,
      formatDate,
      formatISODate,
      isToday,
      goToToday
    };
  }
});
</script>

<style scoped>
/* Dunkles Layout */
:root {
  --ion-background-color: #121212;
  --ion-text-color: #ffffff;
}
ion-page, ion-content, body {
  background-color: var(--ion-background-color);
  color: var(--ion-text-color);
}

/* Kopfzeile */
ion-header, ion-toolbar {
  --background: #1f1f1f;
  --color: #ffffff;
}

/* Buttons */
ion-button {
  --border-color: #267aff;
  --color: #267aff;
  --background: transparent;
}
ion-button:hover {
  background-color: #333333;
}

/* Navigation-Row */
.header-nav {
  margin-bottom: 1em;
}
.header-nav h2 {
  color: #ffffff;
}

/* Kopfzelle der Zeitspalte */
.header-time {
  height: 3em; 
}

/* Zeitspalte links */
.time-label-col {
  background-color: #1f1f1f;
  font-weight: bold;
  border-right: 1px solid #267aff;
}
.time-text {
  padding: 0.5em;
  border-bottom: 1px solid #333333;
}

/* Kopf der Tage */
.day-header {
  background-color: #1f1f1f;
  border-bottom: 1px solid #267aff;
  text-align: center;
  padding: 0.5em;
}
.active-day .day-header {
  border: 2px solid #267aff;
}

/* Rows der Zeiten */
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

/* Events */
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

/* Alles anzeigen, nicht abschneiden */
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