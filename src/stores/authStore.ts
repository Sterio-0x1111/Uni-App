import { defineStore, StoreDefinition } from 'pinia';

export const useAuthStore : StoreDefinition = defineStore('auth', {
    state: () => ({
        isLoggedIn: false as boolean
    }), 
    actions: {
        login(){
            this.isLoggedIn = true;
        }, 
        logout(){
            this.isLoggedIn = false;
        }
    },
    persist: {
        storage: sessionStorage,
    }
})