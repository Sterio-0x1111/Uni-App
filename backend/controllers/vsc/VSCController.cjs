require('dotenv').config();
const { createAxiosClient, getAndParseHTML } = require("../../utils/helpers.cjs");
const axios = require('axios');
const cheerio = require('cheerio');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const VSCPortalService = require('../../services/VSCPortalService.cjs');

/**
 * Endpunkt zur Abwicklung des Logins im VSC.
 * 
 * Der Endpunkt nimmt über den Request die Credentials des Nutzers entgegen 
 * und erstellt eine Instanz von VSCPortalService, 
 * um den Login durchzuuführen. Im Erfolgsfall werden 
 * die Cookies in Session gespeichert.
 * 
 * @async
 * @function loginToVSC2
 * 
 * @param { any } req - Der eingehende Request, welche hier die Credentials des Nutzers enthält.
 * @param { any } res - Die ausgehende Antwort des Servers.
 * 
 * @returns { Promise<void> } - Sendet stattdessen eine Antwort an den Client zurük.
 */
const loginToVSC2 = async (req, res) => {
    if (!req.session.vsc) {
        try {
            const { username, password } = req.body;

            const loginPayload = new URLSearchParams();
            loginPayload.append('asdf', username);
            loginPayload.append('fdsa', password);
            loginPayload.append('submit', 'Anmelden');

            const vscPortal = new VSCPortalService();
            const state = await vscPortal.login(loginPayload);

            if (state) {
                req.session.vsc = vscPortal.cookies;
                req.session.loggedInVSC = true;
                req.session.save();
                res.status(200).json({ message: 'VSC: Erfolgreich eingeloggt!' });
            } else {
                res.status(401).json({ message: 'VSC: Login fehlgeschlagen.' });
            }
        } catch (error) {
            console.log('Fehler beim Login VSC.', error);
            res.status(500).json({ message: 'Fehler beim Login im VSC.' });
        }
    } else {
        res.status(200).json({ message: 'VSC: Bereits eingeloggt.' });
    }
}

/**
 * Endpunkt zum Ausloggen aus dem VSC.
 * 
 * Der Endpunkt prüft, ob der Nutzer eingeloggt ist. 
 * Falls der Nutzer eingeloggt ist, wird der Logout über 
 * eine VSCPortalService Instanz durchgeführt. 
 * Bei erfolgreichem Logout werden die Session Daten gelöscht und es wird eine Erfolgsantwort gesendet.
 * Andernfalls werden Fehlermeldungen zurückgegeb. 
 * 
 * @async
 * @function logoutFromVSC
 * @param { object } req - Das Anfrageobjekt
 * @param { object } res - Das Antwortobjekt 
 * 
 * @returns { Promise<void> } - Gibt stattdessen eine JSON Antwort zurück.
 */
const logoutFromVSC = async (req, res) => {
    if(req.session.vsc){
        try {
            const vscPortal = new VSCPortalService();
            const cookies = req.session.vsc;
            vscPortal.cookies = cookies;
            const logout = await vscPortal.logout();

            if(logout){
                console.log('VSC: Erfolgreich ausgeloggt.');
                req.session.loggedInVSC = false;
                req.session.vsc = null;
                res.status(200).json({ message: 'VSC: Erfolgreich ausgeloggt.' });
            } else {
                console.log('VSC: Nicht ausgeloggt!');
            }
        } catch(error){
            res.status(500).json({ message: 'VSC: Logout fehlgeschlagen.' });
        }
    } else {
        res.status(401).json({ message: 'VSC: Nicht eingeloggt.' });
    }    
}

/**
 * Endpunkt zum Laden der Prüfungsdaten.
 * 
 * Der Endpunkt prüft, ob der Nutzer eingeloggt ist 
 * und erstellt eine Instanz von VSCPortalService, 
 * um die Prüfungen mit den in der Anfrage mitgeschickten Daten zu laden. 
 * 
 * @async 
 * @function getExamsData
 * 
 * @param { object } req - Anfrageobjekt, dass die Parameter category, degree und course für die Filterung der Prüfungsdaten enthält.
 * @param { object } res - Antwortobjekt, welches die Prüfungsdaten zurücksendet.
 * 
 * @returns { Promise<void> } - Gibt stattdessen eine JSON Antwort zurück.
 */
const getExamsData = async (req, res) => {
    if (req.session.vsc) {
        const degree = req.params.degree;
        const course = req.params.course;
        const category = req.params.category; // Notenspiegel, Infos über angemeldete Prüfungen

        try {
            const vscPortal = new VSCPortalService();
            vscPortal.cookies = req.session.vsc;
            const data = await vscPortal.getExamsData(category, degree, course);

            (data.length > 0) ? res.status(200).json({ data }) : res.status(204).json({ data });
        } catch (error) {
            console.log('Fehler beim Parsen der Abschluss- und Studiengangsdaten');
            res.status(500).send('Fehler beim Laden der Studiengangsinformationen.');
        }
    } else {
        console.log('Nicht eingeloggt im VSC.');
        res.status(401).send('Sie sind nicht im VSC eingeloggt.');
    }
}

/**
 * Endpunkt zum Laden der verfügbaren Abschlüsse und Studiengänge.
 * 
 * Der Endpunkt erstellt eine Instanz von VSCPortalService 
 * und lädt darüber die Abschlüsse und Studiengänge eines Studierenden aus dem VSC.
 * 
 * @async 
 * @function getDegreesAndCourses
 * 
 * @param { object } req - Anfrageobjekt
 * @param { object } res - Antwortobjekt
 * 
 * @returns { Promise<void> } - Gibt stattdessen eine JSON Antwort zurück und liefert die Daten mit
 */
const getDegreesAndCourses = async (req, res) => {
    if(req.session.vsc){
        const vscPortal = new VSCPortalService();
        vscPortal.cookies = req.session.vsc;
        const result = await vscPortal.getDegreesAndCourses();
        res.status(200).json({ degrees: result.degrees, bachelorPage: result.bachelorPage, masterPage: result.masterPage });
    } else {
        res.status(401).json({ message: 'VSC: Nicht eingeloggt!' });
    }
}

module.exports = { logoutFromVSC, loginToVSC2, getDegreesAndCourses, getExamsData, };