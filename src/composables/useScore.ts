import { ref, computed, onMounted, filter } from 'vue';

export function useSocre() {
    const showSelection = ref(true);

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
    // TODO: Kurs Selektion aus RegisteredExams einbauen und Backend entsprechend anpassen

    const toolbarTitle = "Notenspiegel";
    const scores = ref([]);
    const mpScores = ref([]);
    const slScores = ref([]);
    const pkScores = ref([]);
    const isModalOpen = ref(false);
    const selectedRowData = ref({});
    const backdropDismiss = ref(true); // Dynamisch steuern, ob das Modal durch Klicken auf den Hintergrund geschlossen werden kann

    const category = "Notenspiegel";
    // TODO: Kurs Selektion
    const degree = ref('Abschluss BA Bachelor');
    const course = ref('');

    const showModal = (row: any[]) => {
        if (row[0] === "PK" && (row[3].includes(",") || row[3] === "")) {
            selectedRowData.value = {
                Art: row[0],
                Nr: row[1],
                Modul: row[2],
                Note: row[3],
                Status: row[4],
                Anerkannt: row[5],
                ECTS: row[6],
                Freivermerk: row[7],
            };
        } else {
            selectedRowData.value = {
                Art: row[0],
                Nr: row[1],
                Modul: row[2],
                Semester: row[3],
                Note: row[4],
                Status: row[5],
                Anerkannt: row[6],
                ECTS: row[7],
                Freivermerk: row[8],
            };
        }

        // Optional: Modus für das Schließen durch den Hintergrund anpassen
        backdropDismiss.value = true; // Falls du das Modal beim Klicken auf den Hintergrund schließen willst
        isModalOpen.value = true;
    };

    onMounted(async () => {
        try {
            const courseStore = useCourseStore();
            const examStore = useExamStore();

            degrees.value = courseStore.degrees;
            selectedDegree.value = (degrees.value.length === 1) ? degrees.value[0] : degrees.value[1];

            courses.value = courseStore.bachelorCourses;
            selectedCourse.value = (courses.value.length > 0) ? courses.value[0] : null;

            //await loadData();
            scores.value = await examStore.loadData(category, selectedDegree.value, selectedCourse.value);
            mpScores.value = examStore.mpScores;
            slScores.value = examStore.slScores;
            pkScores.value = examStore.pkScores;

        } catch (error) {
            console.log(error);
        }
    });

    const loadData = async () => {
        try {
            const url = `http://localhost:3000/api/vsc/exams/${category}/${selectedDegree.value}/${selectedCourse.value}`;
            console.log(url);
            const response = await axios.get(url, { withCredentials: true });
            if (response.status !== 200) {
                throw new Error(`${response.status}`);
            }

            scores.value = response.data.data;

            mpScores.value = scores.value.filter((target: (string | number)[]) => target[0] === "MP");
            slScores.value = scores.value.filter((target: (string | number)[]) => target[0] === "SL");
            pkScores.value = scores.value.filter((target: (string | number)[]) => target[0] === "PK");

        } catch (error) {
            console.log(error);
        }
    }

    const tableHeaders = [
        { id: 0, text: "PrfArt" },
        { id: 1, text: "Prüfungsnr." },
        { id: 2, text: "Prüfungstext" },
        { id: 3, text: "Semester" },
        { id: 4, text: "Note" },
        { id: 5, text: "Status" },
        { id: 6, text: "Anerkannt" },
        { id: 7, text: "ECTS" },
        { id: 8, text: "Freivermerk" },
        { id: 9, text: "Versuch" },
        { id: 10, text: "Prüfungsdatum" },
    ];

    const limitedHeaders = computed(() => {
        switch (selectedOption.value) {
            case selectOptions[1].text:
                return [tableHeaders[2], tableHeaders[4], tableHeaders[10]];
            case selectOptions[2].text:
                return [tableHeaders[2], tableHeaders[3], tableHeaders[5]];
            case selectOptions[3].text:
                return [
                    tableHeaders[2],
                    tableHeaders[4],
                    tableHeaders[5],
                    tableHeaders[7],
                ];
            default:
                return [tableHeaders[0], tableHeaders[2], tableHeaders[5]];
        }
    });

    const headerIndices = computed(() => {
        const headers = [...tableHeaders];

        if (selectedOption.value === "PK") {
            headers.splice(3, 1);
        }

        const indices: number[] = [];
        limitedHeaders.value.forEach((element: any) => {
            indices.push(headers.indexOf(element));
        });
        return indices;
    });

    const selectOptions = [
        { id: 0, text: "Alle Einträge" },
        { id: 1, text: "Modulprüfungen" },
        { id: 2, text: "Studienleistungen" },
        { id: 3, text: "PK" },
    ];

    const selectedOption = ref(selectOptions[1].text);

    // Computed Property zur Filterung der Daten basierend auf der Auswahl
    const filteredScores = computed(() => {
        switch (selectedOption.value) {
            case "Modulprüfungen":
                return mpScores.value;
            case "Studienleistungen":
                return slScores.value;
            case "PK":
                pkScores.value.forEach((element: (string | number)[]) => {
                    const actualElement = (Array.isArray(element) ? element : Array.from(element));
                    if (actualElement[0] === "PK" && (actualElement[3].includes("S") || actualElement[3].includes("W"))) {
                        actualElement.splice(3, 1);
                    }
                });
                return pkScores.value;
            default:
                return scores.value; // Alle Einträge anzeigen
        }
    });

    const limitedScores = computed(() => {
        switch (selectedOption.value) {
            case selectOptions[1].text:
                return [
                    filteredScores.value[2],
                    filteredScores.value[4],
                    filteredScores.value[10],
                ];
            default:
                return [];
        }
    });

    return {
        degrees,
        selectedDegree,
        currentCourses,
        selectedCourse,
        showSelection,
        scores,
        selectedOption,
        limitedHeaders,
        headerIndices,
        showModal,
        filteredScores,
        isModalOpen,
        selectedRowData,
        backdropDismiss,
    }
}