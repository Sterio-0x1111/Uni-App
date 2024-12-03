<template>
    <ion-modal :is-open="isOpen" :backdrop-dismiss="backdropDismiss">
        <ion-header>
            <ion-toolbar>
                <ion-title>Details</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="closeModal">OK</ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        
        <ion-content>
            <ion-list>
                <ion-item v-for="(v, k) in data" :key="k">
                    <span class="left">{{ k }}</span>
                    <br>
                    <p class="right">{{ v }}</p>
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-modal>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { IonHeader, IonToolbar, IonTitle, IonModal, IonButtons, IonButton, IonContent, IonList, IonItem } from '@ionic/vue';

const props = defineProps({
    isOpen: Boolean, 
    data: Object,
    backdropDismiss: Boolean // Dynamisch übergeben
})

const emit = defineEmits(['close']);

const closeModal = () => {
    emit('close');
}

const handleKeyDown = (event) => {
    if (event.key === 'Escape' || event.key === 'Backspace') {
        closeModal(); // Schließt das Modal
    }
};

// Globale Event-Listener hinzufügen, wenn das Modal geöffnet wird
onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
});

// Event-Listener entfernen, wenn das Modal geschlossen wird
onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
ion-item {
    display: flex;
    justify-content: space-between;
    width: 100%;
}

.right {
    flex: 1;
    text-align: right;
}

.left {
    flex: 1;
    text-align: left;
}
</style>