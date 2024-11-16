import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
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
    }
})