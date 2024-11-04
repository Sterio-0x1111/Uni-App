const { fetchHTML, handleError, createAxiosClient, deserializeCookieJar, getAndParseHTML } = require("../utils/helpers.cjs");
const axios = require('axios');
const cheerio = require('cheerio');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const { VSCPortal } = require('../classes/VSCPortal.cjs');

const loginToVSC = async (req, res) => {
    if(!req.session.vsc){
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
        if(state){
            req.session.vsc = vscPortal;
            resCode = 200;
            message = 'Erfolgreich eingeloggt.';
        }

        res.status(resCode).json({ message: message })

    } else {
        res.status(200).json({ message: 'VSC: Bereits eingeloggt.' });
    }
}

const loginToVSC_ORIGINAL = async (req, res) => {
    if (!req.session.vscCookies) {
        console.log('ENTERED LOGIN');
        const { username, password } = req.body;
        const loginPageURL = 'https://vsc.fh-swf.de/qisserver2/rds?state=user&type=1&category=auth.login&startpage=portal.vm&breadCrumbSource=portal';

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
                console.log('ERFOLGREICH EINGELOGGT');

                res.status(200).json({
                    data,
                    message: 'VSC Login erfolgreich.'
                });
            } else {
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

const getExamResults = async (req, res) => {
    if (req.session.vsc) {
        const client = createAxiosClient(req.session.vscCookies);

        const homepageUrl = 'https://vsc.fh-swf.de/qisserver2/rds?state=user&type=0';

        try {
            const homepageResponse = await getAndParseHTML(client, homepageUrl, 'Meine Prüfungen');
            const generalExamsPageResponse = await getAndParseHTML(client, homepageResponse.filteredURL, 'Notenspiegel');
            let scoreOptionsPageResponse = await getAndParseHTML(client, generalExamsPageResponse.filteredURL, 'Abschluss BA Bachelor');
            let scoreResponse = await client.get(scoreOptionsPageResponse.filteredURL, { withCredentials: true });

            if (!scoreResponse.data.includes('Informatik')) {
                scoreOptionsPageResponse = await getAndParseHTML(client, generalExamsPageResponse.filteredURL, 'Abschluss BA Bachelor');
                scoreResponse = await client.get(scoreOptionsPageResponse.filteredURL, { withCredentials: true });
            }

            const $ = cheerio.load(scoreResponse.data);

            /*const link = $('a').filter(function () {
                return $(this).attr('title') === 'Leistungen für Informatik  (PO-Version 19)  anzeigen';
            });*/

            const ul = $('ul.treelist').eq(1);
            const links = $(ul).find('li a[href]').attr('href');//.attr('href');
            //const course = $(ul).find('li span').html().replace(/[\n\t]/g, '').trim();
            const response = await client.get(links, { withCredentials: true });
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
            console.log(clearedTable);
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

const getExamResults_ORIGINAL = async (req, res) => {
    if (req.session.vscCookies) {
        const client = createAxiosClient(req.session.vscCookies);

        const homepageUrl = 'https://vsc.fh-swf.de/qisserver2/rds?state=user&type=0';

        try {
            const homepageResponse = await getAndParseHTML(client, homepageUrl, 'Meine Prüfungen');
            const generalExamsPageResponse = await getAndParseHTML(client, homepageResponse.filteredURL, 'Notenspiegel');
            let scoreOptionsPageResponse = await getAndParseHTML(client, generalExamsPageResponse.filteredURL, 'Abschluss BA Bachelor');
            let scoreResponse = await client.get(scoreOptionsPageResponse.filteredURL, { withCredentials: true });

            if (!scoreResponse.data.includes('Informatik')) {
                scoreOptionsPageResponse = await getAndParseHTML(client, generalExamsPageResponse.filteredURL, 'Abschluss BA Bachelor');
                scoreResponse = await client.get(scoreOptionsPageResponse.filteredURL, { withCredentials: true });
            }

            const $ = cheerio.load(scoreResponse.data);

            /*const link = $('a').filter(function () {
                return $(this).attr('title') === 'Leistungen für Informatik  (PO-Version 19)  anzeigen';
            });*/

            const ul = $('ul.treelist').eq(1);
            const links = $(ul).find('li a[href]').attr('href');//.attr('href');
            //const course = $(ul).find('li span').html().replace(/[\n\t]/g, '').trim();
            const response = await client.get(links, { withCredentials: true });
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
            console.log(clearedTable);
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

const getRegisteredExams = async (req, res) => {
    console.log('UPDATED');
    if (req.session.vscCookies) {

        const client = createAxiosClient(req.session.vscCookies);
        const homepageUrl = 'https://vsc.fh-swf.de/qisserver2/rds?state=user&type=0';

        try {

            const homepageResponse = await getAndParseHTML(client, homepageUrl, 'Meine Prüfungen');
            const generalInformationPageResponse = await getAndParseHTML(client, homepageResponse.filteredURL, 'Info über angemeldete Prüfungen');
            let selectedDegreePageResponse = await getAndParseHTML(client, generalInformationPageResponse.filteredURL, 'Abschluss BA Bachelor');
            let registeredExamsPage = await client.get(selectedDegreePageResponse.filteredURL, { withCredentials: true });
            // TODO: Filterstring ersetzen durch dynamischen Parameter für Abschluss (BA/MA -> Auswahl im Frontend)

            if (!registeredExamsPage.data.includes('Informatik')) {
                selectedDegreePageResponse = await getAndParseHTML(client, generalInformationPageResponse.filteredURL, 'Abschluss BA Bachelor');
                registeredExamsPage = await client.get(selectedDegreePageResponse.filteredURL, { withCredentials: true });
            }

            let $ = cheerio.load(registeredExamsPage.data);

            const ul = $('ul.treelist').eq(1);
            const links = $(ul).find('li a[href]').map((index, element) => $(element).attr('href')).get();
            const course = $(ul).find('li span').map((index, element) => $(element).html().replace(/[\n\t]/g, '').trim()).get();
        
            console.log(links);
            console.log(course);

            const response = await client.get(links[0], { withCredentials: true });
            const html = response.data;

            $ = cheerio.load(html);

            const table = $('table').eq(1);
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

const testNav = async (req, res) => {
}

module.exports = { loginToVSC, logoutFromVSC, testNav, getExamResults, getRegisteredExams };