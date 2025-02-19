<template>
    <div v-if="isLoading" class="loading-overlay">
        <IonSpinner name="crescent" />
        <p>{{ message }}</p>
    </div>
</template>

<script setup lang="ts">
import { IonSpinner } from '@ionic/vue';

const props = defineProps({
    isLoading: {
        type: Boolean,
        required: true
    },
    message: {
        type: String,
        default: 'Lade Daten...'
    }
});
</script>

<style scoped>
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    /* Hintergrund-Farbe für Hellmodus */
    background-color: rgba(150, 150, 150, 0.7);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    /* Über allen anderen Elementen */
    color: #161616;
}

/* Für den Dark Mode */
@media (prefers-color-scheme: dark) {
    .loading-overlay {
        /* Dunklere Hintergrund-Farbe */
        background-color: rgba(50, 50, 50, 0.85);
        color: #f3f3f3;
    }
}

.loading-overlay p {
    margin-top: 10px;
    font-size: 16px;
}
</style>