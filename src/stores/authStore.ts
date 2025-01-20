import { defineStore } from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        isLoggedIn: false as boolean,
        isLoggedInVSC: false as boolean,
        isLoggedInHSP: false as boolean
    }), 
    actions: {
        login(){
            this.isLoggedIn = true;
        }, 
        logout(){
            this.isLoggedIn = false;
        },
        async getStates(){
            try {
                const url = 'http://localhost:3000/api/states';
                const response = await axios.get(url, { withCredentials: true });
                if(response.status === 200){
                    const data = response.data;
                    this.isLoggedInVSC = data.stateVSC;
                    this.isLoggedInHSP = data.stateHSP;
                }

                return {
                    vsc:    this.isLoggedInVSC,
                    hsp:    this.isLoggedInHSP,
                    vpis:   false
                }

            } catch(error){
                console.log('Fehler beim Laden der Login Status.', error);
            }
        }
    },
    persist: {
        storage: sessionStorage,
    }
})