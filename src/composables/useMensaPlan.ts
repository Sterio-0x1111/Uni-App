import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import { useLocationStore } from '@/stores/locationStore'
import { useMensaStore } from '@/stores/mensaStore'
import { onUnmounted } from 'vue';

export function useMensaPlan() {
    //const mensaStore = useMensaStore()
    //const { mensas, categoryIcons } = mensaStore

    const showSelection = ref(true);
    const mensas = [
        { id: 1, name: "Hagen", url: "https://www.stwdo.de/mensa-cafes-und-catering/fh-suedwestfalen/hagen" },
        { id: 2, name: "Iserlohn", url: "https://www.stwdo.de/mensa-cafes-und-catering/fh-suedwestfalen/iserlohn" },
        { id: 3, name: "Meschede", url: "https://www.stwdo.de/mensa-cafes-und-catering/fh-suedwestfalen/meschede" },
        { id: 4, name: "Soest", url: "https://www.stwdo.de/mensa-cafes-und-catering/fh-suedwestfalen/soest" }
    ]

    const iconBaseURL = '/assets/icons';
    const categoryIcons = {
        'Tagesgericht': iconBaseURL + '/icon-tagesgericht.png',
        'Aktionsteller': iconBaseURL + '/icon-aktionsteller.png',
        'Menü 1': iconBaseURL + '/icon-menue-1.png',
        'Menü 2': iconBaseURL + '/icon-menue-2.png',
        'Klimateller': iconBaseURL + '/icon-bite.png',
        'Vegetarisches Menü': iconBaseURL + '/icon-veggie-menue.png',
        'Ohne Fleisch': iconBaseURL + '/icon-vegetarisch.png',
        'Vegane Speise': iconBaseURL + '/icon-vegan.png',
        'Mit Fisch bzw. Meeresfrüchten': iconBaseURL + '/icon-fisch.png',
        'Mit Rindfleisch': iconBaseURL + '/icon-rind.png',
        'Mit Geflügel': iconBaseURL + '/icon-gefluegel.png',
        'Mit Schweinefleisch': iconBaseURL + '/icon-schwein.png',
        'Beilagen': iconBaseURL + '/icon-beilagen.png',
        'Fleisch aus artgerechter Haltung': iconBaseURL + 'icon-artgerechte-haltung.png'
    }

    const selectedMensa = ref(null);
    const mensaPlan = ref(null);
    const selectedDate = ref(null);
    const dateSelection = ref([]);

    // Berechne den Namen der ausgewählten Mensa
    const selectedMensaName = computed(() => {
        const mensa = mensas.find(m => m.name === selectedMensa.value)
        return mensa ? mensa.name : ''
    })

    const locationStore = useLocationStore();
    const nextLocation = ref('');
    const nextDistance = ref(-1);
    const loading = ref(false);
    const loadingMessage = ref('');

    // Lade den Mensaplan basierend auf der ausgewählten Mensa
    const loadMensaPlan = async () => {
        loadingMessage.value = 'Mensaplan wird geladen...';
        const mensa = mensas.find(m => m.name === selectedMensa.value);
        //const mensa = selectedMensa.value.toLowerCase();

        if (mensa) {
            try {
                console.log('Lade Mensaplan für', mensa.name);
                const response = await axios.get(`http://localhost:3000/api/meals/${encodeURIComponent(mensa.name)}/${selectedDate.value}`);
                //const response = await axios.get(`http://localhost:3000/api/meals?mensa=${mensa.name}&date=${selectedDate.value}`);
                const meals = response.data;
                console.log(meals.value);
                mensaPlan.value = (meals && response.status === 200) ? meals.table : null;
            } catch (error) {
                console.log('Fehler beim Laden des Mensaplan:', error);
                mensaPlan.value = null;
            } finally {
                loading.value = false;
            }
        }
        //loading.value = false;
    }

    const loadSelectionOptions = async () => {
        //const mensaName = selectedMensaName.value.toLowerCase();
        const mensaName = selectedMensa.value.toLowerCase();

        try {
            const response = await axios.get(`http://localhost:3000/api/mensa/options/${mensaName}`);
            //const response = await axios.get(`http://localhost:3000/api/meals/dates?loc=${mensaName}`);
            const data = await response.data;

            // Speichere die Datumsauswahl-Optionen in der reaktiven Liste
            dateSelection.value = data.options;
            selectedDate.value = data.options[0].optionValue;
            await loadMensaPlan();
        } catch (error) {
            console.log('Fehler beim Laden der Optionen:', error);
            dateSelection.value = [];
        } finally {
            loading.value = false;
        }
    }

    const fetchLocation = async () => {
        try {
            loading.value = true;
            loadingMessage.value = 'Warten auf Standortermittlung...';
            const locationWrapper = await locationStore.getLocation();
            if(locationWrapper.location !== 'Lüdenscheid'){
                selectedMensa.value = locationWrapper.location;
                nextLocation.value = locationWrapper.location;
                nextDistance.value = locationWrapper.distance;
            } else {
                selectedMensa.value = locationStore.alternateLocation;
                nextLocation.value = locationStore.alternateLocation;
                nextDistance.value = locationStore.alternateLocationDistance;
            }
            
        } catch (error) {
            console.error('Fehler bei Standortermittlung', error);
        } finally {
            loading.value = false;
        }
    };

    onMounted(async () => {
        await fetchLocation();
        await loadSelectionOptions();
        /*const locationStore = useLocationStore();

        if (!locationStore.nextLocation) {
            loadingMessage.value = 'Warten auf Standortermittlung...';
            loading.value = true;
            const success = await locationStore.locateClient();

            if (success) {
                selectedMensa.value = locationStore.nextLocation;
                nextLocation.value = locationStore.nextLocation;
                nextDistance.value = Math.round((locationStore.nextLocationDistance / 1000) * 100) / 100; // Umrechnung in km
                loading.value = false;
                await loadSelectionOptions();
                //loading.value = false;
            } else {
                loading.value = false;
            }
        } else {
            selectedMensa.value = locationStore.nextLocation;
            nextLocation.value = locationStore.nextLocation;
            nextDistance.value = Math.round((locationStore.nextLocationDistance / 1000) * 100) / 100; // Umrechnung in km
            await loadSelectionOptions();
        }*/
    })

    

    return {
        showSelection,
        selectedMensa,
        mensaPlan,
        selectedDate,
        dateSelection,
        nextLocation,
        nextDistance,
        loading,
        loadingMessage,
        mensas,
        categoryIcons,
        loadSelectionOptions,
        loadMensaPlan
    }
}