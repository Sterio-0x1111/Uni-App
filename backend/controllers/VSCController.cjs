require('dotenv').config();
const { fetchHTML, handleError, createAxiosClient, deserializeCookieJar, getAndParseHTML } = require("../utils/helpers.cjs");
const axios = require('axios');
const cheerio = require('cheerio');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const { VSCPortal } = require('../classes/VSCPortal.cjs');
//const { useCourseStore } = require('../../src/stores/courseStore.ts');

const loginToVSC2 = async (req, res) => {
    if (!req.session.vsc) {
        const { username, password } = req.body;
        const loginPageURL = 'https://vsc.fh-swf.de/qisserver2/rds?state=user&type=1&category=auth.login&startpage=portal.vm&breadCrumbSource=portal';

        const loginPayload = new URLSearchParams();
        loginPayload.append('asdf', username);
        loginPayload.append('fdsa', password);
        loginPayload.append('submit', 'Anmelden');

        const vscPortal = new VSCPortal();
        let resCode = 401;
        let message = 'Nicht eingeloggt.';

        const state = await vscPortal.login(loginPayload);
        console.log(state);
        if (state) {
            req.session.vsc = vscPortal.cookies;
            req.session.save();
            resCode = 200;
            message = 'Erfolgreich eingeloggt.';
        }

        res.status(resCode).json({ message: message })

    } else {
        res.status(200).json({ message: 'VSC: Bereits eingeloggt.' });
    }
}

const loginToVSC = async (req, res) => {
    if (!req.session.vscCookies) {
        console.log('ENTERED LOGIN');
        const { username, password } = req.body;
        const loginPageURL = process.env.VSC_LOGIN_URL;

        const cookieJar = new CookieJar();
        const client = wrapper(axios.create({ jar: cookieJar, withCredentials: true }));

        const loginPayload = new URLSearchParams();
        loginPayload.append('asdf', username);
        loginPayload.append('fdsa', password);
        loginPayload.append('submit', 'Anmelden');

        try {
            const response = await client.post(loginPageURL, loginPayload.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                }
            });

            const data = response.data;

            if (data.includes('Meine Prüfungen')) {
                req.session.loggedInVSC = false; // provisorisch deaktiviert
                req.session.user = { username };
                req.session.vscCookies = cookieJar;
                req.session.save();
                console.log('EINGELOGGT');

                res.status(200).json({
                    data,
                    message: 'VSC Login erfolgreich.'
                });
            } else {
                console.log('FAILURE LOGIN');
                res.status(401).json({
                    data,
                    message: 'VSC Login fehlgeschlagen.'
                });
            }

        } catch (error) {
            console.log('Failed to login to VSC.', error);
            res.status(500).send('Fehler beim Login.');
        }
    } else {
        res.status(200).json({ message: 'VSC: Bereits eingeloggt.' });
    }
}

const logoutFromVSC = async (req, res) => {
    if (req.session.loggedInVSC) {
        const cookieJar = deserializeCookieJar(req.session.vscCookies);
        const client = createAxiosClient(cookieJar);

        const url = 'https://vsc.fh-swf.de/qisserver2/rds?state=user&type=0';
        const response = await client.get(url);
        const initialData = response.data;
        const $ = cheerio.load(response.data);

        const filteredLinks = $('a').filter(function () {
            return $(this).text().includes('bmelden');
        });

        const logoutURL = filteredLinks.first().attr('href');

        try {
            const response = await client.get(logoutURL);
            const data = response.data;
            //const $ = cheerio.load(data);

            if (data.includes('Sicherheitshinweis')) {
                console.log('VSC: Erfolgreich ausgeloggt.');
                req.session.loggedInVSC = false;
                req.session.vscCookies = undefined;

                res.status(200).json({
                    data
                })

            } else {
                console.log('Logout fehlgeschlagen.');
                res.status(500).json({ message: 'VSC Logout fehlgeschlagen.' })
            }

            res.json({
                data,
                state: req.session.loggedInVSC
            });

        } catch (error) {
            console.log('VSC: Fehler beim Ausloggen.\n', error);
            res.status(500).json({ data: initialData });
        }
    } else {
        res.status(200).json({ message: 'VSC bereits ausgeloggt.' })
    }
}

const getExamResults2 = async (req, res) => {
    if (req.session.vsc) {
        const vscPortal = new VSCPortal();
        vscPortal.cookies = req.session.vsc;
        console.log(req.session.vsc);
        //const client = vscPortal.getClient();

        if(vscPortal instanceof VSCPortal){
            console.log('INSTANZ');
            const results = await vscPortal.getExamsResults();
            console.log(results);
        } else {
            console.log(typeof vscPortal);
        }
        
    } else {
        console.log('401: Nicht eingeloggt');
        console.log(deserializeCookieJar(req.session.vscCookies));
        res.status(401).json({ message: 'Nicht eingeloggt.' });
    }
}

const getExamResults = async (req, res) => {
    if (req.session.vscCookies) {
        const client = createAxiosClient(req.session.vscCookies);
        const course = req.params.course;
        const degree = req.params.degree;
        //const course = 'Informatik  (PO-Version 19)';

        const homepageUrl = 'https://vsc.fh-swf.de/qisserver2/rds?state=user&type=0';

        try {
            const homepageResponse = await getAndParseHTML(client, homepageUrl, 'Meine Prüfungen');
            const generalExamsPageResponse = await getAndParseHTML(client, homepageResponse.filteredURL, 'Notenspiegel');
            let scoreOptionsPageResponse = await getAndParseHTML(client, generalExamsPageResponse.filteredURL, 'Abschluss BA Bachelor');
            let scoreResponse = await client.get(scoreOptionsPageResponse.filteredURL, { withCredentials: true });

            if (!scoreResponse.data.includes(course)) {
                scoreOptionsPageResponse = await getAndParseHTML(client, generalExamsPageResponse.filteredURL, 'Abschluss BA Bachelor');
                scoreResponse = await client.get(scoreOptionsPageResponse.filteredURL, { withCredentials: true });
            }

            const $ = cheerio.load(scoreResponse.data);

            const ul = $('ul.treelist').eq(1);
            const links = $(ul).find('li a[href]').map((index, element) => $(element).attr('href')).get();
            const courses = $(ul).find('li span').map((index, element) => $(element).html().replace(/[\n\t]/g, '').trim()).get();
            const response = await client.get(links[courses.indexOf(course)], { withCredentials: true });
            const html = response.data;
            

            const $2 = cheerio.load(html);

            const table = $2('table').eq(1);
            const rows = $2(table).find('tr');

            const tableData = [];
            $2(rows).each((index, row) => {
                const cells = $2(row).find('td').map((i, cell) => $2(cell).text()).get();
                tableData.push(cells);
            })

            const clearedTable = tableData.map(item => item.map(item2 => item2.replace(/\t/g, '').replace(/\n/g, '').trim()));
            //console.log(clearedTable);
            //await getAndParseHTML(client, generalExamsPageResponse.filteredURL, 'Abschluss BA Bachelor');

            res.send(clearedTable);
        } catch (error) {
            res.status(500).json({ message: 'Fehler beim Laden der Prüfungsergebnisse.', error })
            console.log('Fehler beim Laden der Prüfungsergebnisse.', error);
        }
    } else {
        console.log('401: Nicht eingeloggt');
        console.log(deserializeCookieJar(req.session.vscCookies));
        res.status(401).json({ message: 'Nicht eingeloggt.' });
    }
}

// zentrale Logik zum Parsen von Abschluss / Studiengang Links und Tabellen
const getExamsData = async (req, res) => {
    if(req.session.vscCookies){

        const client = createAxiosClient(req.session.vscCookies);
        const homepageURL = 'https://vsc.fh-swf.de/qisserver2/rds?state=user&type=0';

        const degree = req.params.degree;
        const course = req.params.course;
        const category = req.params.category; // Notenspiegel, Infos über angemeldete / abgemeldete Prüfungen

        try {
            // navigiere zur richtigen Seite
            const homepageResponse = await getAndParseHTML(client, homepageURL, 'Meine Prüfungen');
            const categoryResponse = await getAndParseHTML(client, homepageResponse.filteredURL, category);
            let degreeResponse = await getAndParseHTML(client, categoryResponse.filteredURL, degree);
            let courseResponse = await client.get(degreeResponse.filteredURL, { withCredentials: true });

            // falls Liste mit Studiengängen zugeklappt ist
            if(!courseResponse.data.includes(course)){
                degreeResponse = await getAndParseHTML(client, categoryResponse.filteredURL, degree);
                courseResponse = await client.get(degreeResponse.filteredURL, { withCredentials: true });
            }

            // Parsen der Zielseite nach Ergebnistabelle
            let $ = cheerio.load(courseResponse.data);

            const ul = $('ul.treelist').eq( (degree.includes('Master')) ? 2 : 1 );
            const links = $(ul).find('li a[href]').map((index, element) => $(element).attr('href')).get();
            const courseNames = $(ul).find('li span').map((index, element) => $(element).html().replace(/[\n\t]/g, '').trim()).get();

            const response = await client.get(links[courseNames.indexOf(course)], { withCredentials: true });
            const html = response.data;

            // Parsen der Ergebnistabelle
            $ = cheerio.load(html);
            const table = $('table').eq((degree.includes('Master') ? 2 : 1));
            const rows = $(table).find('tr');
            const headers = $(table).find('th');

            const tableHeaders = $(headers).map((index, header) => $(header).text().trim()).get();
            const tableData = [];

            $(rows.slice(1)).each((index, row) => {
                const cells = $(row).find('td').map((i, cell) => $(cell).text()).get();
                tableData.push(cells);
            })

            const clearedTable = tableData.map(item => item.map(item2 => item2.replace(/\t/g, '').replace(/\n/g, '').trim()));

            let responseCode = 200;
            let data = clearedTable;
            let found = true;

            if (clearedTable.length === 0) {
                responseCode = 200;
                data = 'Keine Daten gefunden.';
                found = false;
            }

            //console.log(responseData);

            res.status(responseCode).json({ data, found: found });

        } catch(error){
            console.log('Fehler beim Parsen der Abschluss- und Studiengangsdaten');
            res.status(500).send('Fehler beim Laden der Studiengangsinformationen.');
        }

    } else {
        console.log('Nicht eingeloggt im VSC.');
        res.status(401).send('Sie sind nicht im VSC eingeloggt.');
    }
}

const getRegisteredExams = async (req, res) => {
    if (req.session.vscCookies) {
        const degree = req.params.degree;
        const course = req.params.course;

        const client = createAxiosClient(req.session.vscCookies);
        const homepageUrl = 'https://vsc.fh-swf.de/qisserver2/rds?state=user&type=0';

        try {
            const homepageResponse = await getAndParseHTML(client, homepageUrl, 'Meine Prüfungen');
            const generalInformationPageResponse = await getAndParseHTML(client, homepageResponse.filteredURL, 'Info über angemeldete Prüfungen');
            let selectedDegreePageResponse = await getAndParseHTML(client, generalInformationPageResponse.filteredURL, degree);
            let registeredExamsPage = await client.get(selectedDegreePageResponse.filteredURL, { withCredentials: true });
            // TODO: Filterstring ersetzen durch dynamischen Parameter für Abschluss (BA/MA -> Auswahl im Frontend)

            if (!registeredExamsPage.data.includes('Diesen Zweig zuklappen')) {
                selectedDegreePageResponse = await getAndParseHTML(client, generalInformationPageResponse.filteredURL, degree);
                registeredExamsPage = await client.get(selectedDegreePageResponse.filteredURL, { withCredentials: true });
            }

            let $ = cheerio.load(registeredExamsPage.data);

            const ul = $('ul.treelist').eq(1);
            const links = $(ul).find('li a[href]').map((index, element) => $(element).attr('href')).get();
            const courses = $(ul).find('li span').map((index, element) => $(element).html().replace(/[\n\t]/g, '').trim()).get();
            const response = await client.get(links[courses.indexOf(course)], { withCredentials: true });
            const html = response.data;

            $ = cheerio.load(html);
            const table = $('table').eq((degree.includes('Master') ? 2 : 1));
            const rows = $(table).find('tr');
            const headers = $(table).find('th');

            const tableHeaders = $(headers).map((index, header) => $(header).text().trim()).get();
            const tableData = [];

            $(rows.slice(1)).each((index, row) => {
                const cells = $(row).find('td').map((i, cell) => $(cell).text()).get();
                tableData.push(cells);
            })

            const clearedTable = tableData.map(item => item.map(item2 => item2.replace(/\t/g, '').replace(/\n/g, '').trim()));

            let resCode = 200;
            let data = clearedTable;
            let found = true;

            if (clearedTable.length === 0) {
                resCode = 200;
                data = 'Keine Daten gefunden.';
                found = false;
            }

            res.status(resCode).json({ data: data, found: found });

        } catch (error) {
            console.log('Fehler beim Laden der angemeldeten Prüfungen', error);
            res.status(500).json({ error: 'Fehler beim Laden der angemeldeten Prüfungen.' });
        }
    } else {
        console.log('VSC: Nicht eingeloggt.');
        res.status(401).send('Nicht eingeloggt!');
    }
}

const getReg = async (req, res) => {
    if (req.session.vscCookies) {
        const client = createAxiosClient(req.session.vscCookies);
        const homepageUrl = 'https://vsc.fh-swf.de/qisserver2/rds?state=user&type=0';
        const avaibleDegrees = ['Abschluss BA Bachelor'];

        try {
            const homepageResponse = await getAndParseHTML(client, homepageUrl, 'Meine Prüfungen');
            const generalInformationPageResponse = await getAndParseHTML(client, homepageResponse.filteredURL, 'Info über angemeldete Prüfungen');
            let degreeSelectionPage = await getAndParseHTML(client, generalInformationPageResponse.filteredURL, avaibleDegrees[0]);
            let examsPage = await client.get(degreeSelectionPage.filteredURL, { withCredentials: true });

            if (!examsPage.data.includes('Diesen Zweig zuklappen')) {
                degreeSelectionPage = await getAndParseHTML(client, generalInformationPageResponse.filteredURL, avaibleDegrees[0]);
                examsPage = await client.get(degreeSelectionPage.filteredURL, { withCredentials: true });
            }

            const data = examsPage.data;
            // TODO: Für Master Studiengänge erweitern
            res.status(200).json({ degrees: avaibleDegrees, bachelorPage: data });

            /*const resultsBachelor = getCoursesAndDegrees(examsPage.data);

            console.log('BACHELOR');
            console.log(resultsBachelor);

            // TODO: Umbauen auf Master Studiengänge parsen (ul treelist holen und kurse und links parsen, wie unten bei bachelor)
            const masterAvailable = degreeSelectionPage.html.includes('Master')

            if (masterAvailable) {
                avaibleDegrees.push('Abschluss MA Master');

                const resultsMaster = getCoursesAndDegrees(examspage.data, true);
            }

            // aktuell werden nur Bachelor Daten gesendet, umstellen für Master
            res.status(200).json({
                degrees: avaibleDegrees,
                bachelor: resultsBachelor,
                ...(masterAvailable && { master: resultsMaster })
            });*/

        } catch (error) {
            console.log('Fehler beim Laden der angemeldeten Prüfungen', error);
            res.status(500).json({ error: 'Fehler beim Laden der angemeldeten Prüfungen.' });
        }
    } else {
        console.log('VSC: Nicht eingeloggt.');
        res.status(401).send('Nicht eingeloggt!');
    }
}

const getCoursesAndDegrees = (data, master = false) => {
    try {
        const $ = cheerio.load(data);
        const ul = $('ul.treelist').eq((master) ? 2 : 1);
        const links = $(ul).find('li a[href]').map((index, element) => $(element).attr('href')).get();
        const courses = $(ul).find('li span').map((index, element) => $(element).html().replace(/[\n\t]/g, '').trim()).get();

        // Mapping von Studiengängen und deren Links
        const mappedResults = links.map((link, index) => ({
            name: courses[index],
            link: link
        }));

        return mappedResults;
    } catch (error) {
        console.log('Fehler beim Laden der Studiengänge und Abschlüsse.', error);
    }
}

const testNav = async (req, res) => {
    if (req.session.vscCookies) {
        const client = createAxiosClient(req.session.vscCookies);
        const homepageUrl = 'https://vsc.fh-swf.de/qisserver2/rds?state=user&type=0';
        const avaibleDegrees = ['Abschluss BA Bachelor', 'Abschluss MA Master'];

        try {
            const homepageResponse = await getAndParseHTML(client, homepageUrl, 'Meine Prüfungen');
            const generalInformationPageResponse = await getAndParseHTML(client, homepageResponse.filteredURL, 'Info über angemeldete Prüfungen');
            res.json({ page: generalInformationPageResponse.html });

            //res.status(resCode).json({ data: data, found: found });

        } catch (error) {
            console.log('Fehler beim Laden der angemeldeten Prüfungen', error);
            res.status(500).json({ error: 'Fehler beim Laden der angemeldeten Prüfungen.' });
        }
    } else {
        console.log('VSC: Nicht eingeloggt.');
        res.status(401).send('Nicht eingeloggt!');
    }
}

module.exports = { loginToVSC, logoutFromVSC, loginToVSC2, testNav, getExamResults, getExamResults2, getRegisteredExams, getReg, getExamsData };