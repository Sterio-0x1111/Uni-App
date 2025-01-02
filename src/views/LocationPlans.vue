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
            
        <div v-if="nextDistance">
            <p>Nächster Studienstandort: {{ nextLocation }}</p>
            <p>Entfernung: {{ nextDistance }} km</p>
        </div>

            <div v-for="image in filteredImages" :key="image">
                <img :src="image.path" />
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonContent, IonSelect, IonSelectOption } from '@ionic/vue';
import { ref, onMounted, computed, onBeforeMount } from 'vue';
import ToolbarMenu from './ToolbarMenu.vue';
import { useLocationStore } from '@/stores/locationStore';

const toolbarTitle = 'Lagepläne';
const images = ref([]);
const locations = [ 'Hagen', 'Iserlohn', 'Meschede', 'Soest', 'Lüdenscheid' ];
const selectedLocation = ref(locations[0]);
const nextLocation = ref(null);
const locationStore = useLocationStore();
const nextDistance = ref(null);

const filteredImages = computed(() => {
    return images.value.filter((image) => image.location === selectedLocation.value);
})

onMounted(async () => {
    const success = await locationStore.locateClient();
    console.log(success);
    //nextDistance.value = locationStore.nextLocationDistance;
    //console.log(nextDistance.value, locationStore.nextLocationDistance);
    if(success){
        console.log('Entered -1', nextDistance.value);
        selectedLocation.value = locationStore.nextLocation;
        nextLocation.value = locationStore.nextLocation;
        nextDistance.value = Math.round( (locationStore.nextLocationDistance / 1000) * 100 ) / 100; // Umrechnung in km
    }

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