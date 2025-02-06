import { useSemesterStore } from '@/stores/semesterStore';
import { ref, onMounted } from 'vue';
import { useAuthStore } from "@/stores/authStore";
import { useCourseStore } from "@/stores/courseStore";
import { useExamStore } from "@/stores/examStore";
import { useRouter } from 'vue-router';


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