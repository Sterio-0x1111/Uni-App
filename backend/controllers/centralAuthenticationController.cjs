const axios = require('axios');

/**
 * TODO: Login / Logout zentralisieren
 * 1. alle Login Endpunkte hierher als Funktion integrieren
 * 2. zentrale Login / Logout Endpunkte definieren und die einzelnen Funktionen aufrufen
 * 3. beim Login setTimeout für automatischen logout setzen, falls Session abläuft
 * 4. beim Logout Session zerstören 
 * 5. im Frontend authStore setTimeout setzen, um nach Ablauf zu zerstören
 * 6. im Frontend authStore bei Login / Logout jeweils die Endpunkte aufrufen
 */

const centralLogin = async (req, res) => {
    try {

        const { username, password } = req.body;

        const baseURL = 'http://localhost:3000/api';
        const vscResponse = await axios.post(baseURL + '/vsc/login', { username, password }, { withCredentials: true });
        const hspResponse = await axios.get(baseURL + '/hsp/login', { username, password }, { withCredentials: true });
        const vpisResponse = await axios.get(baseURL + '/vpis/login', { username, password }, { withCredentials: true });

        let resCode = 401;
        let message = 'Nicht eingeloggt.';
        
        if(vscResponse.status === 200){
            resCode = 200;
            message = 'Erfolgreich eingeloggt.';
        }

        res.status(vscResponse.status).json(vscResponse.data);
        
        //const cookies = vscResponse.headers['set-cookie'];

        // TODO: anpassen für mehrere Cookies von den unterschiedlichen Logins
        /*cookies.forEach(cookie => {
            res.setHeader('Set-Cookie', cookie);
        });*/

        //res.status(resCode).json({ message });

    } catch(error){
        console.log('Fehler beim zentralen Login.', error);
    }
}

const centralLogout = async (req, res) => {
    try {

        const baseURL = 'http://localhost:3000/api';

        const vscResponse = await axios.post(baseURL + '/vsc/logout', { withCredentials: true });
        const vpisResponse = await axios.get(baseURL + '/vpis/logout', { withCredentials: true });
        const hspResponse = await axios.get(baseURL + '/hsp/logout', { withCredentials: true });

    } catch(error){
        console.log(error);
    }
}

module.exports = { centralLogin, centralLogout };