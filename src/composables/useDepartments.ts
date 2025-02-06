import { useDepartmentStore } from '@/stores/departmentStore';
import { ref, onMounted } from 'vue';
import axios from 'axios';

export function useDepartments() {
    const departmentStore = useDepartmentStore();
    const selectedDepartment = ref({ department: '', type: '' });
    const departments = ref([]);

    const dates = ref(null);
    const tables = ref(null);
    const lists = ref(null);

    const tableHeaders = ['Ereignis', 'Termin'];
    const courseOptions = ref(null);
    const selectedCourse = ref(null);

    onMounted(async () => {
        try {
            departments.value = await departmentStore.getDepartments();

        } catch (error) {
            console.log(error);
        }
    });
    
    const loadData = async () => {
        try {
            const url = 'http://localhost:3000/api/departments/dates';
            const response = await axios.post(url, { department: selectedDepartment.value.department });
            const data = response.data;
            const type = selectedDepartment.value.type;

            switch (type) {
                case 'link':
                    resetStatus();
                    courseOptions.value = data.tableData;
                    break;

                case 'text':
                    resetStatus();
                    lists.value = data.tableData;

                    console.log('TEXT ENTERED');
                    console.log(data.tableData);
                    break;

                default: // simple
                    resetStatus();
                    dates.value = data.tableData;
            }

        } catch (error) {
            console.log(error);
        }
    };

    const loadCourseData = async () => {
        try {
            const url = 'http://localhost:3000/api/departments/course';
            const response = await axios.post(url, { url: selectedCourse.value });
            const data = response.data;

            if (data.tables.length > 0) {
                tables.value = data.tables;
                dates.value = null;
            } else {
                dates.value = data.dates;
                tables.value = null;
            }
            console.log(dates);

        } catch (error) {
            console.log(error);
        }
    }

    const resetStatus = () => {
        dates.value = null;
        tables.value = null;
        courseOptions.value = null;
    }
    
    return {
        selectedDepartment, 
        selectedCourse,
        departments, 
        dates, 
        tables,
        lists,
        tableHeaders,
        courseOptions,
        loadCourseData,
        loadData,
        resetStatus,
    }
}