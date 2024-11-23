<template>
    <ion-page>
        <ion-header>
            <toolbar-menu :menuTitle="toolbarTitle" />
        </ion-header>

        <ion-content>
            <ion-select v-model="selectedLocation">
                <ion-select-option v-for="location in locations" :key="location">
                    {{ location }}
                </ion-select-option>
            </ion-select>
            <div v-for="image in filteredImages" :key="image">
                <img :src="image.path" />
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonContent, IonSelect, IonSelectOption } from '@ionic/vue';
import { ref, onMounted, computed } from 'vue';
import ToolbarMenu from './ToolbarMenu.vue';

const toolbarTitle = 'Lagepläne';
const images = ref([]);
const locations = [ 'Hagen', 'Iserlohn', 'Meschede', 'Soest', 'Lüdenscheid' ];
const selectedLocation = ref(locations[0]);

const filteredImages = computed(() => {
    return images.value.filter((image) => image.location === selectedLocation.value);
})

onMounted(() => {
    images.value = [
        { location: 'Hagen',        path: '/assets/locations/hagen/hagen_1.png' },
        { location: 'Hagen',        path: '/assets/locations/hagen/hagen_2.png' },
        { location: 'Iserlohn',     path: '/assets/locations/iserlohn/iserlohn_1.png' },
        { location: 'Meschede',     path: '/assets/locations/meschede/meschede_1.png' },
        { location: 'Meschede',     path: '/assets/locations/meschede/meschede_2.png' },
        { location: 'Soest',        path: '/assets/locations/soest/soest_1.png' },
        { location: 'Lüdenscheid',  path: '/assets/locations/luedenscheid/luedenscheid_1.png' }
    ]
});
</script>

<style scoped>

</style>