import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from './authStore';

export const useCourseStore = defineStore('courseStore', {

    state: () => ({
        degrees: [] as string[],
        bachelorCourses: [] as string[],
        masterCourses: [] as string[],
        selectedDegree: null as string | null,
        selectedCourse: null as string | null
    }),
    actions: {
        async fetchCourses() {
            const authStore = useAuthStore();
            if(!authStore.isLoggedIn){
                console.log('Studiengänge können nicht geladen werden. Nicht angemeldet.');
                return;
            }

            try {
                const response = await axios.get('http://localhost:3000/api/vsc/exams/reg', { withCredentials: true });
                this.degrees = response.data.degrees;
                this.bachelorCourses = response.data.bachelor;
                this.masterCourses = response.data.master;
            } catch (error) {
                console.log('Fehler beim Laden von Studiengängen.', error);
            }
        }
    }
});