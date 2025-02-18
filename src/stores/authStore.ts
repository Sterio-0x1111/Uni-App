import { defineStore } from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        isLoggedIn:     false as boolean,
        isLoggedInVSC:  false as boolean,
        isLoggedInHSP:  false as boolean,
        isLoggedInVPIS: false as boolean,
        logoutTimer: null as ReturnType<typeof setTimeout> | null,
    }), 
    actions: {
        async centralLogin(username: string, password: string) : Promise<boolean> {
            const vscURL = 'http://localhost:3000/api/vsc/login';
            const vscResponse = await axios.post(vscURL, { username: username, password: password }, { withCredentials: true });
            
            const hspURL = "http://localhost:3000/api/hsp/login";
            const hspResponse = await axios.post(hspURL, { username: username, password: password }, { withCredentials: true });

            const vpsiURL = "http://localhost:3000/api/vpis/login";
            const vpisResponse = await axios.post(vpsiURL, { username: username, password: password }, { withCredentials: true });
            
            this.isLoggedInVSC = vscResponse.status === 200;
            this.isLoggedInHSP = hspResponse.status === 200;
            this.isLoggedInVPIS = vpisResponse.status === 200;

            if(this.isLoggedInHSP || this.isLoggedInVSC || this.isLoggedInVPIS){
                this.setLogoutTimer();
                return true;
            }
            
            return false;
        },
        async logout() : Promise<void>{
            try {
                let vscResponse;
                let hspResponse;
                let vpisResponse;

                if (this.isLoggedInVSC) {
                    const vscURL = 'http://localhost:3000/api/vsc/logout';
                    vscResponse = await axios.get(vscURL, { withCredentials: true });
                    this.isLoggedInVSC = false;
                }

                if (this.isLoggedInHSP) {
                    const hspURL = "http://localhost:3000/api/hsp/logout";
                    hspResponse = await axios.get(hspURL, { withCredentials: true });
                    this.isLoggedInHSP = false;
                }

                if (this.isLoggedInVPIS) {
                    const vpisURL = "http://localhost:3000/api/vpis/logout";
                    vpisResponse = await axios.get(vpisURL, { withCredentials: true });
                    this.isLoggedInVPIS = false;
                }

                if (!this.isLoggedInVSC && !this.isLoggedInVPIS && !this.isLoggedInHSP ) {
                    this.cancelLogoutTimer();
                    alert('Sie sind ausgeloggt!');
                    window.location.reload();
                }
            } catch(error) {
                console.log('Fehler beim automatischen Logout.', error);
            }
        },
        async getStates(){
            try {
                const response = await axios.get('http://localhost:3000/api/states', { withCredentials: true });
                if (response.status === 200) {
                    const data = response.data;
                    this.isLoggedInVSC = data.stateVSC;
                    this.isLoggedInHSP = data.stateHSP;
                    this.isLoggedInVPIS = data.stateVPIS;
                }

                return {
                    vsc:  this.isLoggedInVSC,
                    hsp:  this.isLoggedInHSP,
                    vpis: this.isLoggedInVPIS
                }

            } catch(error){
                console.log('Fehler beim Laden der Login-Status:', error);
            }
        },
        setLogoutTimer() {
            // Vorherigen Timer abbrechen, falls vorhanden
            if (this.logoutTimer) {
                clearTimeout(this.logoutTimer);
            }
            this.logoutTimer = setTimeout(() => {
                this.logout();
            }, 1000 * 60 * 20); // 20 Minuten
            console.log('Logout-Timer gesetzt.');
        },
      
        cancelLogoutTimer(): void {
            if (this.logoutTimer !== null) {
                clearTimeout(this.logoutTimer); // Timeout abbrechen
                this.logoutTimer = null; // Timeout-ID zurücksetzen
                console.log('Logout-Timer wurde abgebrochen.');
            }
        }
    },
    persist: {
        storage: sessionStorage,
    }
});