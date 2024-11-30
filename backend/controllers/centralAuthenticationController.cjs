const axios = require('axios');

const centralLogin = async (req, res) => {
    try {

        const { username, password } = req.body;

        const baseURL = 'http://localhost:3000/api/vsc/login';
        const vscResponse = await axios.post(baseURL, { username, password }, { withCredentials: true });
        //const vscResponse = await axios.post(baseURL + '/vsc/login', { username, password }, { withCredentials: true });
        // const vpisResponse = await axios.get(baseURL + '/vpis/login', { withCredentials: true });
        // const hspResponse = await axios.get(baseURL + '/hsp/login', { withCredentials: true });

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