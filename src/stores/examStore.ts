import { defineStore, mapState, StoreDefinition } from 'pinia';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

export const useExamStore = defineStore('exams', {
    state: () => ({
        scores:     [] as string[], 
        mpScores:   [] as string[],
        slScores:   [] as string[],
        pkScores:   [] as string[],
        authStore: useAuthStore()
    }), 
    actions: {
        async loadData(category: string, selectedDegree: string, selectedCourse: string) : Promise<string[]> {
            try {
              if(this.scores.length === 0 && this.authStore.isLoggedInVSC){
                const url = `http://localhost:3000/api/vsc/exams/${category}/${selectedDegree}/${selectedCourse}`;
                const response = await axios.get(url, { withCredentials: true });
                if (response.status !== 200) {
                  throw new Error(`${response.status}`);
                }
          
                this.scores = response.data.data;
          
                this.mpScores = this.scores.filter((target : (string | number)[]) => target[0] === "MP");
                this.slScores = this.scores.filter((target : (string | number)[]) => target[0] === "SL");
                this.pkScores = this.scores.filter((target : (string | number)[]) => target[0] === "PK");
              }
              return this.scores;
          
            } catch(error){
              console.log(error);
              alert('Es gab einen Fehler beim Laden der Prüfungsergebnisse. Bitte versuchen Sie es erneut.');
              return [];
            }
          }
    },
    persist: {
        storage: sessionStorage,
    }
})