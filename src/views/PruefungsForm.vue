<template>
    <IonPage>
        <IonHeader>
            <IonToolbar>
                <IonTitle>Prüfungssuche</IonTitle>
            </IonToolbar>
        </IonHeader>

        <IonContent>
            <IonGrid>
                <form @submit.prevent="submitSearch">
                    <IonCard>
                        <IonCardContent>
                            <IonRow>
                                <IonCol size="6">
                                    <IonItem>
                                        <IonLabel position="stacked">Modulname enthält</IonLabel>
                                        <IonInput v-model="bezeichnung" placeholder="z.B. Produktmanagement"></IonInput>
                                    </IonItem>
                                </IonCol>

                                <IonCol size="6">
                                    <IonItem>
                                        <IonLabel position="stacked">Durchführung</IonLabel>
                                        <IonSelect v-model="pruefer" placeholder="Wählen Sie einen Prüfer">
                                            <IonSelectOption value="">---------</IonSelectOption>
                                            <IonSelectOption value="255">n.n</IonSelectOption>
                                            <IonSelectOption value="1183">Albrecht, Arnd</IonSelectOption>
                                            <!-- Weitere Optionen hinzufügen -->
                                        </IonSelect>
                                    </IonItem>
                                </IonCol>
                            </IonRow>

                            <IonRow>
                                <IonCol size="4">
                                    <IonItem>
                                        <IonLabel position="stacked">Prüfungsart</IonLabel>
                                        <IonSelect v-model="pruefart" placeholder="Prüfungsart auswählen">
                                            <IonSelectOption value="">---------</IonSelectOption>
                                            <IonSelectOption value="K">Klausur</IonSelectOption>
                                            <IonSelectOption value="M">Mündliche Prüfung</IonSelectOption>
                                            <!-- Weitere Optionen hinzufügen -->
                                        </IonSelect>
                                    </IonItem>
                                </IonCol>

                                <IonCol size="4">
                                    <IonItem>
                                        <IonLabel position="stacked">Semester</IonLabel>
                                        <IonSelect v-model="semester" placeholder="Semester auswählen">
                                            <IonSelectOption value="8">Wintersemester 2024/25</IonSelectOption>
                                            <IonSelectOption value="7">Sommersemester 2024</IonSelectOption>
                                            <!-- Weitere Optionen hinzufügen -->
                                        </IonSelect>
                                    </IonItem>
                                </IonCol>

                                <IonCol size="4">
                                    <IonItem>
                                        <IonLabel position="stacked">Prüfungsform</IonLabel>
                                        <IonSelect v-model="pruefungsForm" placeholder="Form auswählen">
                                            <IonSelectOption value="">---------</IonSelectOption>
                                            <IonSelectOption value="A">abschließend</IonSelectOption>
                                            <IonSelectOption value="B">begleitend</IonSelectOption>
                                        </IonSelect>
                                    </IonItem>
                                </IonCol>
                            </IonRow>

                            <!-- Weitere Felder hier hinzufügen -->

                            <IonRow>
                                <IonCol>
                                    <IonButton expand="block" type="submit" color="primary">Suchen</IonButton>
                                </IonCol>
                            </IonRow>
                        </IonCardContent>
                    </IonCard>
                </form>

                <div v-if="exams.length">
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>Prüfungsergebnisse</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonList>
                                <IonItem v-for="exam in exams" :key="exam.pos">
                                    <IonLabel>
                                        <h2>{{ exam.modul }}</h2>
                                        <p>{{ exam.pruefer }} - {{ exam.termin }}</p>
                                    </IonLabel>
                                </IonItem>
                            </IonList>
                        </IonCardContent>
                    </IonCard>
                </div>
            </IonGrid>
        </IonContent>
    </IonPage>
</template>

<script>
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonList,
} from "@ionic/vue";

export default {
    data() {
        return {
            bezeichnung: "",
            pruefer: "",
            pruefart: "",
            semester: "8",
            pruefungsForm: "",
            exams: []
        };
    },
    methods: {
        async submitSearch() {
            const params = new URLSearchParams();
            if (this.bezeichnung) params.append("bezeichnung", this.bezeichnung);
            if (this.pruefer) params.append("pruefer", this.pruefer);
            if (this.pruefart) params.append("pruefart", this.pruefart);
            if (this.semester) params.append("semester", this.semester);
            if (this.pruefungsForm) params.append("pruefungs_form", this.pruefungsForm);

            const url = `/api/pruefungsplaene/hagen/technischeBetriebswirtschaft?${params.toString()}`;

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error("Fehler beim Abrufen der Daten.");
                }
                this.exams = await response.json();
            } catch (error) {
                console.error("Fehler:", error);
            }
        }
    }
};
</script>

<style scoped>
/* Füge hier spezifische Styles hinzu */
</style>