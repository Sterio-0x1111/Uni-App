import { ref, computed, onMounted } from 'vue';
import { useLocationStore } from '@/stores/locationStore';

export function useLocation() {
    const locationStore = useLocationStore();
    const locations = [ 'Hagen', 'Iserlohn', 'Meschede', 'Soest', 'Lüdenscheid' ];
    const selectedLocation = ref(locations[1]);
    const nextLocation = ref<string | null>(null);
    const nextDistance = ref<number | null>(null);
    const loading = ref(false);

    const images = ref([
        { location: 'Hagen', path: '/assets/locations/hagen/hagen_1.png' },
        { location: 'Hagen', path: '/assets/locations/hagen/hagen_2.png' },
        { location: 'Iserlohn', path: '/assets/locations/iserlohn/iserlohn_1.png' },
        { location: 'Meschede', path: '/assets/locations/meschede/meschede_1.png' },
        { location: 'Meschede', path: '/assets/locations/meschede/meschede_2.png' },
        { location: 'Soest', path: '/assets/locations/soest/soest_1.png' },
        { location: 'Lüdenscheid', path: '/assets/locations/luedenscheid/luedenscheid_1.png' }
    ]);

    const filteredImages = computed(() => {
        return images.value.filter(image => image.location === selectedLocation.value);
    });

    const fetchLocation = async () => {
        try {
            if (!locationStore.nextLocation) {
                loading.value = true;
                const success = await locationStore.locateClient();

                if (success) {
                    selectedLocation.value = locationStore.nextLocation;
                    nextLocation.value = locationStore.nextLocation;
                    nextDistance.value = Math.round((locationStore.nextLocationDistance / 1000) * 100) / 100;
                }
                loading.value = false;
            } else {
                selectedLocation.value = locationStore.nextLocation;
                nextLocation.value = locationStore.nextLocation;
                nextDistance.value = Math.round((locationStore.nextLocationDistance / 1000) * 100) / 100;
            }
        } catch (error) {
            console.error('Fehler bei Standortermittlung', error);
        }
    };

    onMounted(fetchLocation);

    return {
        locations,
        selectedLocation,
        nextLocation,
        nextDistance,
        loading,
        filteredImages
    };
}