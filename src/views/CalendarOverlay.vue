<template>
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
      <ion-col v-for="(day, index) in weekDates" :key="index" :class="{ 'active-day': isToday(day) }">
        <div class="day-header">
          <strong>{{ dayNames[index] }}</strong>
          <div>{{ formatDate(day) }}</div>
        </div>
      </ion-col>
    </ion-row>

    <!-- Uhrzeit-Raster -->
    <ion-row v-for="(time, idx) in allTimesOfWeek" :key="idx" class="time-row">
      <!-- Linke Spalte: Die Uhrzeit -->
      <ion-col size="0.8" class="time-label-col">
        <div class="time-text">{{ time }}</div>
      </ion-col>

      <!-- Pro Tag eine Zelle: zeige Events, die zu dieser "time" starten -->
      <ion-col v-for="(day, index) in weekDates" :key="index">
        <div v-for="event in eventsByDayAndTime[formatISODate(day)]?.[time] || []" :key="event.id"
          class="event-item">
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { IonContent, IonRow, IonCol, IonButton, IonSpinner } from '@ionic/vue'

type EventItem = {
  id: string
  title: string
  date: string           //  "24.01.2025" or "2025-01-24"
  time: string           //  "09:00-10:30" or "09:00"
  rooms?: string
  dozent?: string
  erstPruefer?: string
  additionalInfos?: string[]
}

const props = withDefaults(
  defineProps<{
    events?: EventItem[];
  }>(),
  {
    events: []
  }
);

const loading = ref(false)
const currentWeekStart = ref(getMonday(new Date()))
const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

// Die 7 Tage der aktuellen Woche
const weekDates = computed(() => {
  const days = []
  for (let i = 0; i < 7; i++) {
    days.push(addDays(currentWeekStart.value, i))
  }
  return days
})

// Damit Events einheitlich verarbeitet werden,
// kann man sie mappen, dass "date" in ein Date-Objekt
// geparsed und "time" ggf. korrigiert wird.
const processedEvents = computed(() => {
  // Filtert nur jene Events, die date/time überhaupt haben:
  return props.events.filter(e => e.date && e.time)
})

// Gruppiert Events nach Datum und Zeit für die wöchentliche Darstellung
const eventsByDayAndTime = computed(() => {
  const result: Record<string, Record<string, EventItem[]>> = {}
  const startOfWeek = currentWeekStart.value
  const endOfWeek = addDays(startOfWeek, 6)

  processedEvents.value.forEach(ev => {
    const dt = parseDate(ev.date)
    // Nur aufnehmen, wenn das Ereignis in der aktuellen Woche liegt
    if (dt >= startOfWeek && dt <= endOfWeek) {
      const iso = formatISODate(dt)
      if (!result[iso]) {
        result[iso] = {}
      }
      const startStr = parseTime(ev.time)
      if (!result[iso][startStr]) {
        result[iso][startStr] = []
      }
      result[iso][startStr].push(ev)
    }
  })

  return result
})

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

// Datum zu Montag der entsprechenden Woche ziehen und auf Mitternacht setzen
function getMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - (day === 0 ? 6 : day - 1)
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
}

// Fügt x Tage zu einem Datum hinzu und setzt die Uhrzeit auf Mitternacht
function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  result.setHours(0, 0, 0, 0)
  return result
}


// Parse "DD.MM.YYYY" oder "YYYY-MM-DD" → Date-Objekt
function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date()
  dateStr = dateStr.trim()

  // Heuristik für "YYYY-MM-DD" (ggf. mit Zeit)
  const ymdMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (ymdMatch) {
    const y = Number(ymdMatch[1])
    const m = Number(ymdMatch[2]) - 1
    const d = Number(ymdMatch[3])
    return new Date(y, m, d)
  }

  // Heuristik für "DD.MM.YYYY" (ggf. mit Zeit)
  const dmyMatch = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/)
  if (dmyMatch) {
    const d = Number(dmyMatch[1])
    const m = Number(dmyMatch[2]) - 1
    const y = Number(dmyMatch[3])
    return new Date(y, m, d)
  }

  // Wenn kein bekanntes Format erkannt wird
  console.warn('Unrecognized date format:', dateStr)
  return new Date()
}

// Ausgabe als "DD.MM.YYYY"
function formatDateLocal(dateObj: Date): string {
  const dd = String(dateObj.getDate()).padStart(2, '0')
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0')
  const yy = dateObj.getFullYear()
  return `${dd}.${mm}.${yy}`
}

// Für HTML-Datenattribute: "YYYY-MM-DD"
function formatISODate(dateObj: Date): string {
  const y = dateObj.getFullYear()
  const m = String(dateObj.getMonth() + 1).padStart(2, '0')
  const d = String(dateObj.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// "09:30-10:30" → "09:30", "08:00Uhr" → "08:00"
function parseTime(str: string): string {
  if (str.includes('-')) {
    return str.split('-')[0].replace('Uhr', '').trim()
  }
  return str.replace('Uhr', '').trim()
}

// "HH:MM" → Anzahl Minuten ab Tagesbeginn, für Sortierung
function timeToMinutes(hhmm: string): number {
  const [hh, mm] = hhmm.split(':')
  return parseInt(hh || '0') * 60 + parseInt(mm || '0')
}

function previousWeek() {
  currentWeekStart.value = addDays(currentWeekStart.value, -7)
}

function nextWeek() {
  currentWeekStart.value = addDays(currentWeekStart.value, 7)
}

function goToToday() {
  currentWeekStart.value = getMonday(new Date())
}

function formatDate(d: Date) {
  return formatDateLocal(d)
}

function isToday(day: Date) {
  const now = new Date()
  return (
    day.getFullYear() === now.getFullYear() &&
    day.getMonth() === now.getMonth() &&
    day.getDate() === now.getDate()
  )
}
</script>

<style scoped>
:root {
  --ion-background-color: #121212;
  --ion-text-color: #ffffff;
}

ion-page,
ion-content,
body {
  background-color: var(--ion-background-color);
  color: var(--ion-text-color);
}

ion-header,
ion-toolbar {
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