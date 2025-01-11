import { defineStore, mapState, StoreDefinition } from 'pinia';
import axios from 'axios';

export const useExamStore = defineStore('exams', {
    state: () => ({
        scores:     [], 
        mpScores:   [],
        slScores:   [],
        pkScores:   [],
    }), 
    actions: {
        async loadData(category: string, selectedDegree: string, selectedCourse: string) {
            try {
              console.log('not empty');
              console.log(this.scores);
              console.log(this.mpScores);
              if(this.scores.length === 0){
                console.log('empty');
                const url = `http://localhost:3000/api/vsc/exams/${category}/${selectedDegree}/${selectedCourse}`;
                const response = await axios.get(url, { withCredentials: true });
                if (response.status !== 200) {
                  throw new Error(`${response.status}`);
                }
          
                this.scores = response.data.data;
          
                this.mpScores = this.scores.filter((target : (string | number)[]) => target[0] === "MP");
                this.slScores = this.scores.filter((target : (string | number)[]) => target[0] === "SL");
                this.pkScores = this.scores.filter((target : (string | number)[]) => target[0] === "PK");
                console.log(this.mpScores)
              }
              return this.scores;
          
            } catch(error){
              console.log(error);
            }
          }
    },
    persist: {
        storage: sessionStorage,
    }
})