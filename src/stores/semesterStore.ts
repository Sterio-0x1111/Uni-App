import { defineStore } from 'pinia';
import axios from 'axios';

export const useSemesterStore = defineStore('semester', {
    state: () => ({
        semesterPeriods: [] as string[],
        feedbackDates: [] as string[],
    }), 
    actions: {
        async getSemesterDates() : Promise<string[]> {
            try {
                console.log('Semester Store 1');
                if(this.semesterPeriods.length === 0){
                    console.log('Semester Store 1: if');
                    const response = await axios.get('http://localhost:3000/api/semester/dates');
                    const data = response.data;
                    this.semesterPeriods = data;
                }
                return this.semesterPeriods;
            } catch(error){
                console.error('Fehler beim Laden der Semesterdaten.', error);
                return [];
            }
        },
        async getFeedbackInformation() : Promise<string[]> {
            try {
                console.log('Semester Store 2');
                if(this.feedbackDates.length === 0){
                    console.log('Semester Store 1: if');
                    const response = await axios.get('http://localhost:3000/api/semester/feedback');
                    const data = response.data;
                    this.feedbackDates = data;
                }
                return this.feedbackDates;
        
            } catch(error){
                console.log('Fehler beim Laden der Rückmeldedaten.', error);
                return [];
            }
        }
    },
    persist: {
        storage: sessionStorage,
    }
})