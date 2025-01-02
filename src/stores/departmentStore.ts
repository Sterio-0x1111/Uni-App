import { defineStore } from 'pinia';
import axios from 'axios';

export const useDepartmentStore = defineStore('department', {
    state: () => ({
        departments: [] as String[]
    }), 
    actions: {
        async getDepartments(){
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
        }
    },
    persist: {
        storage: sessionStorage,
    }
})