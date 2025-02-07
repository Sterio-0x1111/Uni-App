<template>
    <ion-page>
        <ion-header>
            <toolbarMenu :menuTitle="'Wochenplan ' + selectedWeek" iconName="newspaper" />
        </ion-header>

        <ion-content>
            <loadingOverlay :isLoading="loading" />
            <custom-toggle v-model="showSelection" />

            <!-- Wochenplan-Select -->
            <ion-item v-if="showSelection">
                <ion-label>Wähle einen Wochenplan</ion-label>
                <ion-select v-model="selectedWeek" @ionChange="fetchData" placeholder="Wochenplan wählen">
                    <ion-select-option v-for="week in calendarData.availableWeeks" :key="week" :value="week">
                        {{ week }}
                    </ion-select-option>
                </ion-select>
            </ion-item>

            <!-- Studiendaten / Info -->
            <ion-card v-if="tableTop.length && showSelection">
                <ion-card-header>
                    <ion-card-title>Studiendaten / Info</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                    <div class="table-wrapper">
                        <table class="my-table">
                            <tbody>
                                <tr v-for="(row, rowIndex) in tableTop" :key="'top-' + rowIndex">
                                    <component v-for="(cell, cellIndex) in row" :key="cellIndex"
                                        :is="cell.tag === 'th' ? 'th' : 'td'" :colspan="cell.colspan"
                                        :rowspan="cell.rowspan" :class="cell.class" :title="cell.title">
                                        <template v-if="cell.link">
                                            <a :href="cell.link.href" target="_blank" class="link-button"
                                                :title="cell.link.title || cell.title">
                                                {{ cell.link.text || cell.text || 'Link' }}
                                            </a>
                                        </template>
                                        <template v-else>
                                            {{ cell.text }}
                                        </template>
                                    </component>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </ion-card-content>
            </ion-card>

            <!-- Kalender -->
            <ion-card v-if="tableBottom.length">
                <ion-card-header>
                    <ion-card-title>Kalender / Semesterplan</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                    <div class="table-wrapper">
                        <table class="my-table">
                            <tbody>
                                <tr v-for="(row, rowIndex) in tableBottom" :key="'bottom-' + rowIndex">
                                    <component v-for="(cell, cellIndex) in row" :key="cellIndex"
                                        :is="cell.tag === 'th' ? 'th' : 'td'" :colspan="cell.colspan"
                                        :rowspan="cell.rowspan" :class="cell.class" :title="cell.title">
                                        <template v-if="cell.link">
                                            <a :href="cell.link.href" target="_blank" class="link-button"
                                                :title="cell.link.title || cell.title"
                                                @click="handleWeekChange(cell.link.href, $event)">
                                                {{ cell.link.text || 'Link' }}
                                            </a>
                                        </template>
                                        <template v-else>
                                            {{ cell.text }}
                                        </template>
                                    </component>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </ion-card-content>
            </ion-card>

            <ion-card v-if="termineData?.termine?.events?.length">
                <ion-card-header>
                    <ion-card-title>Termine für {{ termineData.week }}</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                    <ion-list>
                        <ion-item v-for="(event, eventIndex) in termineData.termine.events"
                            :key="`${event.time}-${event.day}-${eventIndex}`">
                            <ion-label>
                                <h3>{{ event.time }} - {{ event.day }}</h3>
                                <p>{{ event.details?.text || 'Keine Details verfügbar' }}</p>
                                <a v-if="event.details?.link" :href="event.details.link.href" target="_blank"
                                    class="event-link">
                                    {{ event.details.link.text }}
                                </a>
                            </ion-label>
                        </ion-item>
                    </ion-list>
                </ion-card-content>
            </ion-card>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem, IonLabel, IonSelect, IonSelectOption } from '@ionic/vue';
import toolbarMenu from '../ToolbarMenu.vue'
import loadingOverlay from "../LoadingOverlay.vue";
import customToggle from '../VSC/CustomToggle.vue'
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/vpis/calendar';

const selectedWeek = ref('');
const calendarData = ref({ headline: '', availableWeeks: [] });
const tableStructure = ref([]);
const termineData = ref(null);
const loading = ref(false);
const showSelection = ref(false);

const tableTop = ref([]);
const tableBottom = ref([]);

async function fetchData() {
    if (!selectedWeek.value) return;
    try {
        loading.value = true;
        const response = await axios.get(`${API_URL}?week=${selectedWeek.value}`, { withCredentials: true });
        if (response.data?.data) {
            calendarData.value = response.data.data.calendarData || { headline: '', availableWeeks: [] };
            tableStructure.value = response.data.data.tableStructure || [];
            termineData.value = response.data.data.termineData || { termine: { events: [] } };

            // Nach dem Laden: Aufsplitten in zwei Teile.
            splitTableData(tableStructure.value);
        } else {
            throw new Error('Ungültige Datenstruktur erhalten');
        }
    } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
    } finally {
        loading.value = false;
    }
}

/**
 * Teilt das tableStructure-Array in zwei Bereiche,
 * z. B. die ersten 3 Zeilen = "oben",
 * und den Rest = "unten".
 */
function splitTableData(fullTable) {
    tableTop.value = fullTable.slice(0, 2);
    tableBottom.value = fullTable.slice(2);
}

function handleWeekChange(href: string, event: MouseEvent) {
    // Standard-Link-Verhalten unterbinden
    event.preventDefault();

    try {
        // Die URL parsen – unter Berücksichtigung der Basis-URL
        const url = new URL(href, window.location.origin);
        const kw = url.searchParams.get('KW');
        if (kw) {
            selectedWeek.value = kw;
            fetchData();
        } else {
            console.warn('Kein KW-Parameter in der URL gefunden:', href);
        }
    } catch (error) {
        console.error('Fehler beim Parsen der URL:', error);
    }
}

onMounted(async () => {
    try {
        loading.value = true;
        const response = await axios.get(API_URL, { withCredentials: true });
        if (response.data?.data?.calendarData) {
            selectedWeek.value = response.data.data.calendarData.currentWeek || '';
            await fetchData();
        } else {
            throw new Error('Fehlerhafte API-Antwort');
        }
    } catch (error) {
        console.error('Fehler beim Initialisieren:', error);
    } finally {
        loading.value = false;
    }
});
</script>

<style scoped>
.table-wrapper {
  overflow-x: auto;
  margin-bottom: 1rem;
}

.my-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #1e1e1e;
  color: #fff;
  margin-top: 1rem;
}

.my-table th,
.my-table td {
  border: 1px solid #444;
  padding: 8px;
  text-align: center;
}

.my-table th {
  background-color: #333;
  font-weight: bold;
}

/* Links */
.link-button,
.event-link {
  color: #00aaff;
  text-decoration: none;
  font-weight: bold;
}

.link-button:hover,
.event-link:hover {
  text-decoration: underline;
}
</style>