<template>
    <IonPage>
        <IonHeader>
            <toolbar-menu :menuTitle="toolbarTitle" iconName="person" />
        </IonHeader>

        <IonContent :fullscreen="true" class="ion-padding">
            <!-- Ladeanzeige -->
            <loadingOverlay :isLoading="loading" />

            <!-- Fehleranzeige -->
            <IonText v-if="error" color="danger" class="error-message">
                {{ error }}
            </IonText>

            <div v-if="data && !loading && !error">
                <!-- Studienfächer -->
                <IonCard>
                    <IonCardHeader>
                        <IonCardTitle>Studienfächer</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <IonList>
                            <IonItem v-for="(fach, index) in data.studienfaecher" :key="index">
                                <IonLabel>
                                    <h2>{{ fach.Fach }}</h2>
                                    <p>Fachsemester: {{ fach.Fachsemester }}</p>
                                    <p>Kennzeichen: {{ fach.Fachkennzeichen }}</p>
                                    <p>PO-Version: {{ fach.Prüfungsordnungsversion }}</p>
                                </IonLabel>
                            </IonItem>
                        </IonList>
                    </IonCardContent>
                </IonCard>

                <!-- Personendaten -->
                <IonCard>
                    <IonCardHeader>
                        <IonCardTitle>Personendaten</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <IonGrid>
                            <IonRow v-for="(value, key) in data.personendaten" :key="key">
                                <IonCol size="4"><strong>{{ key }}</strong></IonCol>
                                <IonCol size="8">{{ value }}</IonCol>
                            </IonRow>
                        </IonGrid>
                    </IonCardContent>
                </IonCard>

                <!-- Kontaktinformationen -->
                <IonCard v-if="data?.infoData?.kontaktinformationen && data.infoData.kontaktinformationen.length > 0">
                    <IonCardHeader>
                        <IonCardTitle>Kontaktinformationen</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <IonAccordionGroup>
                            <IonAccordion v-for="(contact, index) in data.infoData.kontaktinformationen" :key="index">
                                <IonItem slot="header">
                                    <IonLabel>{{ contact.section }}</IonLabel>
                                </IonItem>
                                <div slot="content" class="ion-padding">
                                    <IonList>
                                        <IonItem v-if="contact.emails && contact.emails.length">
                                            <IonLabel>
                                                <strong>E-Mail:</strong>
                                                <p v-for="(email, idx) in contact.emails" :key="idx">{{ email }}</p>
                                            </IonLabel>
                                        </IonItem>
                                        <IonItem v-if="contact.phones && contact.phones.length">
                                            <IonLabel>
                                                <strong>Telefon:</strong>
                                                <p v-for="(phone, idx) in contact.phones" :key="idx">{{ phone }}</p>
                                            </IonLabel>
                                        </IonItem>
                                        <IonItem v-if="contact.address">
                                            <IonLabel>
                                                <strong>Adresse:</strong>
                                                <p>{{ contact.address }}</p>
                                            </IonLabel>
                                        </IonItem>
                                    </IonList>
                                </div>
                            </IonAccordion>
                        </IonAccordionGroup>
                    </IonCardContent>
                </IonCard>
            </div>
        </IonContent>
    </IonPage>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonList, IonItem, IonLabel, IonGrid, IonRow, IonCol, IonText, IonLoading, IonAccordionGroup, IonAccordion } from '@ionic/vue';
import toolbarMenu from "../ToolbarMenu.vue";
import loadingOverlay from '../LoadingOverlay.vue';

const loading = ref<boolean>(true);
const error = ref<string | null>(null);
const data = ref<any>({
  studienfaecher: [],
  personendaten: {},
  infoData: { kontaktinformationen: [] }
});
const toolbarTitle = "Informationen";

const loadData = async () => {
    try {
        loading.value = true;
        const response = await axios.get('http://localhost:3000/api/hsp/scrapeMyS', {
            withCredentials: true
        });
        const rawData = response.data;

        // Studienfächer extrahieren
        data.value.studienfaecher = rawData.filter(item => item.Fach).map(item => ({
            Fach: item.Fach,
            Fachsemester: item.Fachsemester,
            Fachkennzeichen: item.Fachkennzeichen,
            Prüfungsordnungsversion: item.Prüfungsordnungsversion
        }));

        // Personendaten extrahieren
        const personendatenObj = rawData.find(item => item.personendaten);
        if (personendatenObj) {
            data.value.personendaten = personendatenObj.personendaten;
        }

        // Kontaktinformationen extrahieren
        const infoDataObj = rawData.find(item => item.infoData);
        if (infoDataObj) {
            data.value.infoData = infoDataObj.infoData;
        }

    } catch (err: any) {
        error.value = "Fehler beim Laden der Daten: " + err.message;
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.error-message {
  padding: 20px;
  text-align: center;
  font-size: 1.2em;
}
</style>