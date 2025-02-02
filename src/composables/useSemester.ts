import { useSemesterStore } from '@/stores/semesterStore';
import { ref, onMounted } from 'vue';

export function useSemester(){
    const semesterStore = useSemesterStore();
    const semesterPeriods = ref(null);
    const feedbackDates = ref(null);

    onMounted(async () => {
        semesterPeriods.value = await semesterStore.getSemesterDates();
        feedbackDates.value = await semesterStore.getFeedbackInformation();
    });

    return {
        semesterPeriods,
        feedbackDates,
        //onMounted
    }
}