<template>
  <loadingOverlay :isLoading="loading" />
  <calendar-overlay :events="myEvents" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import axios from 'axios'
import CalendarOverlay from '../CalendarOverlay.vue'
import loadingOverlay from '../LoadingOverlay.vue'

/**
 * Dieses Child bekommt von außen eine Angabe,
 * ob 'ingenieur-wirtschaftswissenschaften' oder 'technische-betriebswirtschaft'
 */
const props = defineProps<{
  choice: string | null;
}>()

const myEvents = ref<any[]>([])
const loading = ref(false)

watch(() => props.choice, (newVal: string | null) => {
  if (newVal) {
    loadExamCalendar(newVal)
  }
}, { immediate: true })

async function loadExamCalendar(choice: string) {
  try {
    loading.value = true
    myEvents.value = []

    if (choice === 'ingenieur-wirtschaftswissenschaften') {
      // Meschede-Daten abrufen
      const resp = await axios.get(
        'http://localhost:3000/api/pruefungsplaene/meschede/ingenieur-wirtschaftswissenschaften'
      )
      myEvents.value = transformMeschedeData(resp.data)
    }
    else if (choice === 'technische-betriebswirtschaft') {
      // Hagen-Daten abrufen
      const resp = await axios.get(
        'http://localhost:3000/api/pruefungsplaene/hagen/technische-betriebswirtschaft?url=https://obelix.fh-swf.de/pryfis/pryfung/pruefung/list/?bezeichnung=&pruefer=&pruefart=&semester=8&pruefungs_form=&start__gte=&start__lte=&regelsemester=&per_page=100'
      )
      myEvents.value = transformHagenData(resp.data)
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

// Transformationsfunktion (Meschede)
function transformMeschedeData(apiData: any[]): any[] {
  const events: any[] = []
  apiData.forEach(item => {
    if (item.examSessions && Array.isArray(item.examSessions)) {
      item.examSessions.forEach((session: any) => {
        events.push({
          id: `${item.examNumber}-${session.date}`,
          title: item.title,
          date: session.date,
          time: session.time,
          rooms: session.rooms,
          dozent: item.dozent,
          erstPruefer: item.erstPruefer,
          additionalInfos: item.additionalInfos || []
        })
      })
    }
  })
  return events
}

// Transformationsfunktion (Hagen)
function transformHagenData(hagenData: any[]): any[] {
  const events: any[] = []
  hagenData.forEach(item => {
    let datePart = ''
    let timePart = ''

    if (item.termin.includes(',')) {
      const parts = item.termin.split(',')
      datePart = parts[0].trim()
      timePart = parts[1].trim().replace(/[–-]/, '-')
    } else {
      datePart = item.termin.trim()
    }

    events.push({
      id: item.pos,
      title: item.modul,
      date: datePart,
      time: timePart,
      rooms: item.raeume,
      dozent: item.pruefer,
      erstPruefer: item.pruefer,
      additionalInfos: []
    })
  })
  return events
}
</script>
