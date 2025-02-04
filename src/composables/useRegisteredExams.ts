import { ref, computed, onMounted } from 'vue';
import { useCourseStore } from '@/stores/courseStore';
import axios from 'axios';
import { IonBackdrop } from '@ionic/vue';

export function useRegisteredExams() {
    const showSelection = ref(true);

    const tableIndices = [1, 2, 5];

    const headers = [
        { id: 0, text: 'Prüfungsnr.' },
        { id: 1, text: 'Modul' },
        { id: 2, text: 'Zugelassen' },
        { id: 3, text: 'Vorbehalt.' },
        { id: 4, text: 'Freivermerk' },
        { id: 5, text: 'Versuch' },
        { id: 6, text: 'Prüfer/-in' },
        { id: 7, text: 'Semester' },
        { id: 8, text: 'Prüfungsdatum' }
    ]

    const limitedHeaders = [headers[1], headers[2], headers[5]];

    const exams = ref(null);
    const found = ref(false);

    const degrees = ref([]);
    const courses = ref([]);
    const masterCourses = ref([]);
    const selectedDegree = ref(null);
    const selectedCourse = ref(null);

    const currentCourses = computed(() => {
        switch (selectedDegree.value) {
            case 'Abschluss BA Bachelor':
                return courses.value;
            case 'Abschluss MA Master':
                return masterCourses.value;
            default:
                return null;
        }
    })

    onMounted(async () => {
        try {
            const courseStore = useCourseStore();

            degrees.value = courseStore.degrees;
            selectedDegree.value = (degrees.value.length === 1) ? degrees.value[0] : degrees.value[1];

            courses.value = courseStore.bachelorCourses;
            selectedCourse.value = (courses.value.length > 0) ? courses.value[0] : null;

            await loadData();

        } catch (error) {
            console.log('Fehler beim Laden der angemeldeten Prüfungen vom Server.', error);
        }
    });

    const loadData = async () => {
        try {
            const category = 'Info über angemeldete Prüfungen';
            const url = `http://localhost:3000/api/vsc/exams/${category}/${selectedDegree.value}/${selectedCourse.value}`;
            const response = await axios.get(url, { withCredentials: true });

            if (response.status !== 200) {
                throw new Error(`${response.status}`);
            }

            //exams.value = response.data;
            exams.value = response.data.data;
            found.value = exams.value.found;
            console.log(exams.value);

        } catch (error) {
            console.log('Fehler beim Laden der angemeldeten Prüfungen.', error);
        }
    }

    const isModalOpen = ref(false);
    const selectedRowData = ref(null);
    const showModal = (row: any[]) => {
        selectedRowData.value = {
            'Prüfungsnr.': row[0],
            'Prüfungstext': row[1],
            zugelassen: row[2],
            Vorbehalt: row[3],
            Freivermerk: row[4],
            Versuch: row[5],
            'Prüfer/in': row[6],
            Semester: row[7],
            'Prüfungsdatum': row[8]
        }

        isModalOpen.value = true;
    }

    return {
        degrees,
        exams,
        selectedRowData,
        loadData,
        courses,
        limitedHeaders,
        tableIndices, 
        selectedDegree,
        selectedCourse,
        currentCourses,
        isModalOpen,
        showSelection,
        showModal,
    }
}