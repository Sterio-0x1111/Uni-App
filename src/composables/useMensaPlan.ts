import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useLocationStore } from '@/stores/locationStore'
import { useMensaStore } from '@/stores/mensaStore'

export function useMensaPlan() {
    const mensaStore = useMensaStore()
    const { mensas, categoryIcons } = mensaStore

    const selectedMensa = ref<string | null>(null)
    const mensaPlan = ref<any | null>(null)
    const selectedDate = ref<string | null>(null)
    const dateSelection = ref<Array<{ optionValue: string, optionText: string }>>([])
    const nextLocation = ref<string | null>(null)
    const nextDistance = ref<number>(-1)
    const loading = ref<boolean>(false)
    const loadingMessage = ref<string>('')

    const selectedMensaName = computed(() => {
        const mensa = mensas.find(m => m.name === selectedMensa.value)
        return mensa ? mensa.name : ''
    })

    const loadMensaPlan = async () => {
        if (!selectedMensa.value || !selectedDate.value) return

        loadingMessage.value = 'Lade Mensaplan...'
        loading.value = true

        try {
            console.log('Lade Mensaplan für', selectedMensa.value)
            const response = await axios.get(`http://localhost:3000/api/meals/${encodeURIComponent(selectedMensa.value)}/${selectedDate.value}`)
            mensaPlan.value = (response.data && response.status === 200) ? response.data.table : null
        } catch (error) {
            console.error('Fehler beim Laden des Mensaplans:', error)
            mensaPlan.value = null
        } finally {
            loading.value = false
        }
    }

    const loadSelectionOptions = async () => {
        if (!selectedMensa.value) return

        loadingMessage.value = 'Lade verfügbare Daten...'
        loading.value = true

        try {
            const response = await axios.get(`http://localhost:3000/api/mensa/options/${selectedMensa.value.toLowerCase()}`)
            dateSelection.value = response.data.options || []
            selectedDate.value = dateSelection.value.length > 0 ? dateSelection.value[0].optionValue : null
            await loadMensaPlan()
        } catch (error) {
            console.error('Fehler beim Laden der Optionen:', error)
            dateSelection.value = []
        } finally {
            loading.value = false
        }
    }

    onMounted(async () => {
        const locationStore = useLocationStore()

        if (!locationStore.nextLocation) {
            loadingMessage.value = 'Warten auf Standortermittlung...'
            loading.value = true
            const success = await locationStore.locateClient()

            if (success) {
                selectedMensa.value = locationStore.nextLocation
                nextLocation.value = locationStore.nextLocation
                nextDistance.value = Math.round((locationStore.nextLocationDistance / 1000) * 100) / 100
            }
            loading.value = false
        } else {
            selectedMensa.value = locationStore.nextLocation
            nextLocation.value = locationStore.nextLocation
            nextDistance.value = Math.round((locationStore.nextLocationDistance / 1000) * 100) / 100
        }

        await loadSelectionOptions()
    })

    return {
        selectedMensa,
        mensaPlan,
        selectedDate,
        dateSelection,
        nextLocation,
        nextDistance,
        loading,
        loadingMessage,
        categoryIcons,
        loadSelectionOptions,
        loadMensaPlan
    }
}