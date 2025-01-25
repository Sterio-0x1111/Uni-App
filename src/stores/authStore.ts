import { defineStore } from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        isLoggedIn:     false as boolean,
        isLoggedInVSC:  false as boolean,
        isLoggedInHSP:  false as boolean,
        isLoggedInVPIS:  false as boolean,
        timer: null as number | null,
    }), 
    actions: {
        async centralLogin(username: string, password: string) : Promise<boolean> {
            const vscURL = 'http://localhost:3000/api/vsc/login';
            const vscResponse = await axios.post(vscURL, { username: username, password: password }, { withCredentials: true });
            
            const hspURL = "http://localhost:3000/api/hsp/login";
            const hspResponse = await axios.post(hspURL, { username: username, password: password }, { withCredentials: true });

            const vpsiURL = "http://localhost:3000/api/vpis/login";
            const vpisResponse = await axios.post(vpsiURL, { username: username, password: password }, { withCredentials: true });

            if(vscResponse.status === 200){
                this.isLoggedInVSC = true;
            }

            if(hspResponse.status === 200){
                this.isLoggedInHSP = true;
            }

            if (vpisResponse.status === 200) {
              this.isLoggedInHSP = true;
            }

            if(this.isLoggedInHSP && this.isLoggedInVSC && this.isLoggedInVPIS){
                setTimeout(this.logout, 1000 * 60 * 25);
                return true;
            }
            
            return false;
        },
        async login(){ // vsc
            try {
                const vscURL = 'http://localhost:3000/api/vsc/logout';
                const vscResponse = await axios.get(vscURL, { withCredentials: true });

                if(vscResponse.status === 200){
                    this.isLoggedInVSC = false;
                    alert('Sie wurden ausgeloggt.');
                }
                

            } catch(error){

            }
        }, 
        async logout(){
            try {
                const vscURL = 'http://localhost:3000/api/vsc/logout';
                const vscResponse = await axios.get(vscURL, { withCredentials: true });

                const hspURL = "http://localhost:3000/api/hsp/logout";
                const hspResponse = await axios.get(hspURL, { withCredentials: true });

                const vpisURL = "http://localhost:3000/api/vpis/logout";
                const vpisResponse = await axios.get(vpisURL, { withCredentials: true });

                if(vscResponse.status === 200 && hspResponse.status === 200 && vpisResponse.status === 200){
                    this.isLoggedInVSC = false;
                    this.isLoggedInHSP = false;
                    this.isLoggedInVPIS = false;
                    this.cancelLogoutTimer();
                    alert('Sie wurden vom VSC, HSP, VPIS ausgeloggt.');
                    window.location.reload();
                }
            } catch(error){
                console.log('Fehler beim automatischen Logout.', error);
            }
        },
        async getStates(){
            try {
                const url = 'http://localhost:3000/api/states';
                const response = await axios.get(url, { withCredentials: true });
                if(response.status === 200){
                    const data = response.data;
                    this.isLoggedInVSC = data.stateVSC;
                    this.isLoggedInHSP = data.stateHSP;
                    this.isLoggedInVPIS = data.stateVPIS;
                }

                return {
                    vsc:    this.isLoggedInVSC,
                    hsp:    this.isLoggedInHSP,
                    vpis:   this.isLoggedInVPIS
                }

            } catch(error){
                console.log('Fehler beim Laden der Login Status.', error);
            }
        },
        cancelLogoutTimer() {
            if (this.logoutTimeoutId !== null) {
                clearTimeout(this.logoutTimeoutId);  // Timeout abbrechen
                this.timer = null;  // Timeout-ID zurücksetzen
                console.log('Timer cleared');
            }
        }
    },
    persist: {
        storage: sessionStorage,
    }
})