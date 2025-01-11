import { defineStore, StoreDefinition } from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        isLoggedIn: false as boolean,
        isLoggedInVSC: false as boolean
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
                    console.log(this.isLoggedInVSC);
                }

                return {
                    vsc:    this.isLoggedInVSC,
                    vpis:   false,
                    hsp:    false
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