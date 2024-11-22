<template>
    <ion-page>
        <ion-header>

        </ion-header>

        <ion-content>
            <ion-select v-model="selectedLocation">
                <ion-select-option v-for="location in locations" :key="location">
                    {{ location }}
                </ion-select-option>
            </ion-select>
            <div v-for="image in filteredImages" :key="image">
                <img :src="image" />
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonContent, IonSelect, IonSelectOption } from '@ionic/vue';
import { ref, onMounted, computed } from 'vue';

const images = ref([]);
const locations = [ 'Hagen', 'Iserlohn', 'Meschede', 'Soest', 'Lüdenscheid' ];
const selectedLocation = ref(locations[0]);

const filteredImages = computed(() => {
    switch(selectedLocation.value){
        case locations[0]:
            return [ images.value[0], images.value[1] ];
        case locations[1]:
            return [ images.value[2] ];
        case locations[2]:
            return [ images.value[3], images.value[4] ];
        case locations[3]:
            return [ images.value[5] ];
        case locations[4]:
            return [ images.value[6] ];
        default:
            return [ images.value[0], images.value[1] ];
    }

})

onMounted(() => {
    images.value = [
        '/assets/locations/hagen/hagen_1.png',
        '/assets/locations/hagen/hagen_2.png',
        '/assets/locations/iserlohn/iserlohn_1.png',
        '/assets/locations/meschede/meschede_1.png',
        '/assets/locations/meschede/meschede_2.png',
        '/assets/locations/soest/soest_1.png',
        '/assets/locations/luedenscheid/luedenscheid_1.png'
    ]
});
</script>

<style scoped>

</style>