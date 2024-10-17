<template>
    <ion-modal :is-open="isOpen">
        <ion-header>
            <ion-toolbar>
                <ion-title>Details</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="closeModal">OK</ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        
        <ion-content>

        </ion-content>
    </ion-modal>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
    isOpen: Boolean, 
    data: Object
})

const closeModal = () => {
    props.isOpen = false;
}

</script>