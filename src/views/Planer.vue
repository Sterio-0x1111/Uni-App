<template>
    <IonPage>
        <IonHeader>
            <toolbar-menu :menuTitle="toolbarTitle" iconName="information" />
        </IonHeader>

        <IonContent>
            <div class="loading-container" v-if="loading">
                <IonSpinner name="crescent" />
                <p>Lade Daten...</p>
            </div>

            <div v-if="errorMessage" class="error-message">
                {{ errorMessage }}
            </div>

            <IonGrid v-if="departments.length > 0 && !loading && !errorMessage">
                <IonRow>
                    <IonCol size="12">
                        <IonText color="primary">
                            <h2 class="section-title">Veranstaltungsplanende des Vorlesungsplans in VPIS</h2>
                        </IonText>
                    </IonCol>
                </IonRow>

                <IonRow>
                    <IonCol size="12">
                        <IonList>
                            <IonCard v-for="(department, index) in departments" :key="index" class="department-card">
                                <IonCardHeader>
                                    <IonCardTitle>{{ department.title }}</IonCardTitle>
                                    <IonCardSubtitle>{{ department.location }}</IonCardSubtitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    <IonAccordionGroup>
                                        <IonAccordion v-for="(contact, i) in department.contacts" :key="i">
                                            <IonItem slot="header" lines="none">
                                                <IonLabel>
                                                    <IonText color="primary">
                                                        <h3>{{ contact.name || 'Kontaktname nicht verfügbar' }}</h3>
                                                    </IonText>
                                                </IonLabel>
                                            </IonItem>
                                            <div slot="content">
                                                <p v-if="contact.details">{{ contact.details }}</p>
                                                <a v-if="contact.link" :href="contact.link" target="_blank"
                                                    rel="noopener noreferrer" class="info-link">
                                                    Mehr Informationen
                                                </a>
                                                <p v-else>Keine weiteren Informationen verfügbar.</p>
                                            </div>
                                        </IonAccordion>
                                    </IonAccordionGroup>
                                </IonCardContent>
                            </IonCard>
                        </IonList>
                    </IonCol>
                </IonRow>
            </IonGrid>

            <IonGrid v-if="!loading && departments.length === 0 && !errorMessage">
                <IonRow>
                    <IonCol size="12">
                        <IonText color="medium">
                            <p>Keine Fachbereiche verfügbar.</p>
                        </IonText>
                    </IonCol>
                </IonRow>
            </IonGrid>
        </IonContent>
    </IonPage>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { IonContent, IonHeader, IonPage, IonItem, IonLabel, IonList, IonSpinner, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonAccordionGroup, IonAccordion, IonText } from '@ionic/vue';
import ToolbarMenu from './ToolbarMenu.vue';

interface Contact {
    name: string;
    link?: string;
    details?: string;
}

interface Department {
    title: string;
    location: string;
    contacts: Contact[];
}

const departments = ref<Department[]>([]);
const loading = ref(false);
const errorMessage = ref('');
const toolbarTitle = 'Kontakte';

const fetchDepartments = async () => {
    loading.value = true;
    errorMessage.value = '';
    try {
        const response = await fetch('http://localhost:3000/api/vpisPlaner/planer');
        if (response.ok) {
            const data: Department[] = await response.json();
            departments.value = data;
        } else {
            errorMessage.value = 'Fehler beim Abrufen der Daten.';
        }
    } catch (error) {
        errorMessage.value = 'Ein Fehler ist aufgetreten.';
    } finally {
        loading.value = false;
    }
};

onMounted(fetchDepartments);
</script>

<style scoped>
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.error-message {
    color: red;
    text-align: center;
    margin: 20px;
}

.section-title {
    text-align: center;
    margin: 20px 0;
    font-size: 1.5em;
}

.department-card {
    margin: 10px 0;
    --ion-card-border-radius: 10px;
    --ion-card-padding: 15px;
}

.info-link {
    display: inline-block;
    margin-top: 10px;
    text-decoration: none;
}

.info-link:hover {
    text-decoration: underline;
}

@media (max-width: 768px) {
    .section-title {
        font-size: 1.2em;
    }

    .department-card {
        margin: 5px 0;
    }

    IonCardTitle {
        font-size: 1.2em;
    }

    IonCardSubtitle {
        font-size: 1em;
    }

    h3 {
        font-size: 1em;
    }
}
</style>