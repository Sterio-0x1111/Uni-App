require('dotenv').config();
const VSCPortalService = require('../../services/VSCPortalService.cjs');
const Portal = require('../../services/Portal.cjs');

/**
 * Controller zum Abwickeln von VSC Operationen.
 * 
 * Unterstützte Funktionen:
 * - Login
 * - Logout
 * - Abschlüsse und Studiengänge laden 
 * - Prüfungsdaten laden
 */

/**
 * Endpunkt zur Abwicklung des Logins im VSC.
 * 
 * Der Endpunkt nimmt über den Request die Credentials des Nutzers entgegen 
 * und nutzt den zentralen Login Servcer der Superklasse.
 * Im Erfolgsfall werden 
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
    return Portal.loginService(req, res, VSCPortalService, "vsc", "VSC");
}

/**
 * Endpunkt zum Ausloggen aus dem VSC.
 * 
 * Der Endpunkt prüft, ob der Nutzer eingeloggt ist. 
 * Falls der Nutzer eingeloggt ist, wird der Logout über 
 * den zentralen Logout Service und einer VSCPortalService Instanz durchgeführt. 
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
    return Portal.logoutService(req, res, VSCPortalService, "vsc", "VSC");
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
            const vscPortal = Portal.fromSession(req.session.vsc, VSCPortalService);
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
        const vscPortal = Portal.fromSession(req.session.vsc, VSCPortalService);
        const result = await vscPortal.getDegreesAndCourses();
        res.status(200).json({ degrees: result.degrees, bachelorPage: result.bachelorPage, masterPage: result.masterPage });
    } else {
        res.status(401).json({ message: 'VSC: Nicht eingeloggt!' });
    }
}

module.exports = { logoutFromVSC, loginToVSC2, getDegreesAndCourses, getExamsData, };