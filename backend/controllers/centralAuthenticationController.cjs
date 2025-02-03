const axios = require('axios');

const baseURL = 'http://localhost:3000/api';

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

    const vscLogin = axios.post(`${baseURL}/vsc/login`,
      { username, password },
      { withCredentials: true }
    );
    const hspLogin = axios.post(`${baseURL}/hsp/login`,
      { username, password },
      { withCredentials: true }
    );
    const vpisLogin = axios.post(`${baseURL}/vpis/login`,
      { username, password },
      { withCredentials: true }
    );

    const [vscResponse, hspResponse, vpisResponse] = await Promise.all([ vscLogin, hspLogin, vpisLogin ]);

    let isLoggedIn = false;
    let cookies = [];

    if (vscResponse.status === 200) {
      isLoggedIn = true;
      if (vscResponse.headers['set-cookie']) {
        cookies = cookies.concat(vscResponse.headers['set-cookie']);
      }
    }
    if (hspResponse.status === 200) {
      isLoggedIn = true;
      if (hspResponse.headers['set-cookie']) {
        cookies = cookies.concat(hspResponse.headers['set-cookie']);
      }
    }
    if (vpisResponse.status === 200) {
      isLoggedIn = true;
      if (vpisResponse.headers['set-cookie']) {
        cookies = cookies.concat(vpisResponse.headers['set-cookie']);
      }
    }

    if (isLoggedIn) {
      cookies.forEach((cookie) => {
        res.setHeader('Set-Cookie', cookie);
      });
      // Optionally, set a timeout (using setTimeout)
      return res.status(200).json({ message: 'Erfolgreich eingeloggt.' });
    } else {
      return res.status(401).json({ message: 'Nicht eingeloggt.' });
    }
  } catch (error) {
    console.error('Fehler beim zentralen Login:', error);
    return res.status(500).json({ message: 'Interner Serverfehler.' });
  }
};

const centralLogout = async (req, res) => {
  try {
    const logoutRequests = [
      axios.post(`${baseURL}/vsc/logout`, {}, { withCredentials: true }),
      axios.get(`${baseURL}/hsp/logout`, { withCredentials: true }),
      axios.get(`${baseURL}/vpis/logout`, { withCredentials: true }),
    ];

    await Promise.all(logoutRequests);

    return res.status(200).json({ message: 'Erfolgreich ausgeloggt.' });
  } catch (error) {
    console.error('Fehler beim zentralen Logout:', error);
    return res.status(500).json({ message: 'Interner Serverfehler.' });
  }
};

module.exports = { centralLogin, centralLogout };