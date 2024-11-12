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
import { ref } from 'vue';
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