import { defineStore } from 'pinia';
import axios from 'axios';

export const useDepartmentStore = defineStore('department', {
    state: () => ({
        departments: [] as string[]
    }), 
    actions: {
        async getDepartments() : Promise<string[] | undefined>{
            try {
                if(this.departments.length < 1){
                    const url = 'http://localhost:3000/api/departments';
                    const response = await axios.get(url);
                    this.departments = response.data.departments;
                }

                return this.departments;

            } catch(error){
                console.log(error);
            }
        },

        /*async loadData(selectedDepartment : any) : Promise<void> {
            try {
                const url = 'http://localhost:3000/api/departments/dates';
                const response = await axios.post(url, { department: selectedDepartment.value.department });
                const data = response.data;
                const type = selectedDepartment.type;
    
                switch (type) {
                    case 'link':
                        this.resetStatus();
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
        },
    
        async loadCourseData() : Promise<void> {
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
        }*/
    
        /*const resetStatus = () => {
            dates.value = null;
            tables.value = null;
            courseOptions.value = null;
        }*/
    },
    persist: {
        storage: sessionStorage,
    }
})