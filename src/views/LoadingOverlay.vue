<template>
    <div v-if="isLoading" class="loading-overlay">
        <IonSpinner name="crescent" />
        <p>{{ message }}</p>
    </div>
</template>

<script setup lang="ts">
import { IonSpinner } from '@ionic/vue';

// Definiert die Props für die Komponente
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
    background-color: rgba(255, 255, 255, 0.8);
    /* Halbtransparentes weißes Overlay */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    /* Über allen anderen Elementen */
}

.loading-overlay p {
    margin-top: 10px;
    font-size: 16px;
    color: #333;
}
</style>