<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Semesterzeiten</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-grid>
                <ion-row>
                    <ion-col><strong>Semester</strong></ion-col>
                    <ion-col><strong>Zeitraum</strong></ion-col>
                </ion-row>
                <ion-row v-for="sem in semesterPeriods" :key="sem.semester">
                    <ion-col>sem.semester</ion-col>
                    <ion-col>sem.period</ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
    </ion-page>
</template>

<script setup>
    import { onMounted } from 'vue';

    onMounted(async () => {
        const semesterPeriods = await fetch('http://lpcalhost:3000/api/semester');
    })
</script>