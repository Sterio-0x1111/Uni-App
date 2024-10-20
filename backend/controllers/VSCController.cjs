const { fetchHTML, handleError, createAxiosClient, deserializeCookieJar, getAndParseHTML } = require("../utils/helpers.cjs");
const axios = require('axios');
const cheerio = require('cheerio');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

// axios clients in session speichern, homepage nicht notwendig
//let client = undefined;

const loginToVSC = async (req, res) => {
    if (!req.session.loggedInVSC) {
        const { username, password } = req.body;
        const loginPageURL = 'https://vsc.fh-swf.de/qisserver2/rds?state=user&type=1&category=auth.login&startpage=portal.vm&breadCrumbSource=portal';

        const loginPayload = new URLSearchParams();
        loginPayload.append('asdf', username);
        loginPayload.append('fdsa', password);
        loginPayload.append('submit', 'Anmelden');

        try {
            // Sende den POST-Request zum Login mit Cookies
            const cookies = deserializeCookieJar(req.session.vscCookies);
            const client = createAxiosClient(cookies);

            const response = await client.post(loginPageURL, loginPayload.toString(), {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/png,image/svg+xml,*/*;q=0.8',
                    'Accept-Language': 'de,en-US;q=0.7,en;q=0.3',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Sec-GPC': '1',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'cross-site',
                    'Sec-Fetch-User': '?1',
                    'Priority': 'u=0, i'
                }
            });

            const data = response.data;

            if (data.includes('Meine Prüfungen')) {
                req.session.loggedInVSC = true;
                req.session.save();
            }

            res.json({
                data,
                state: req.session.loggedInVSC
            });

        } catch (error) {
            console.log('Failed to login to VSC.', error);
        }
    } else {
        res.json({ message: 'VSC: Bereits eingeloggt.' });
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
            } else {
                console.log('Logout fehlgeschlagen.');
            }

            res.json({
                data,
                state: req.session.loggedInVSC
            });

        } catch (error) {
            console.log('VSC: Fehler beim Ausloggen.\n', error);
            res.json({ data: initialData });
        }
    }
}

const getExamResults = async (req, res) => {
    if (req.session.loggedInVSC) {
        const cookieJar = deserializeCookieJar(req.session.vscCookies);
        const client = createAxiosClient(cookieJar);
        const homepageUrl = 'https://vsc.fh-swf.de/qisserver2/rds?state=user&type=0';

        
        try {
            const homepageResponse = await getAndParseHTML(client, homepageUrl, 'Meine Prüfungen');
            const generalExamsPageResponse = await getAndParseHTML(client, homepageResponse.filteredURL, 'Notenspiegel');
            const scoreOptionsPageResponse = await getAndParseHTML(client, generalExamsPageResponse.filteredURL, 'Abschluss BA Bachelor');

            let $ = await fetchHTML(scoreOptionsPageResponse.filteredURL, client);
            
            const link = $('a').filter(function () {
                return $(this).attr('title') === 'Leistungen für Informatik  (PO-Version 19)  anzeigen';
            });

            const ul = $('ul.treelist').eq(1);
            const links = $(ul).find('li a[href]').attr('href');
            const course = $(ul).find('li span').html().replace(/[\n\t]/g, '').trim();

            //const url = $(link).attr('href');
            
            const response = await client.get(links);
            const html = response.data;

            $ = cheerio.load(html);
            
            const table = $('table').eq(1);
            const rows = $(table).find('tr');

            const tableData = [];
            $(rows).each((index, row) => {
                const cells = $(row).find('td').map((i, cell) => $(cell).text()).get();
                tableData.push(cells);
            })

            //const clearedTable = tableData.map(item => item.replace(/\t/g, '').replace(/\n/g, '').trim());
            const clearedTable = tableData.map(item => item.map(item2 => item2.replace(/\t/g, '').replace(/\n/g, '').trim()));
            
            res.send(clearedTable);
        } catch(error){
            console.log('Fehler beim Laden der Prüfungsergebnisse.', error);
        }
    }
}

const testNav = async (req, res) => {
    if (req.session.loggedInVSC) {
        const cookieJar = deserializeCookieJar(req.session.vscCookies);
        const client = createAxiosClient(cookieJar);
        const homepageUrl = 'https://vsc.fh-swf.de/qisserver2/rds?state=user&type=0';

        
        try {
            const homepageResponse = await getAndParseHTML(client, homepageUrl, 'Meine Prüfungen');
            const generalExamsPageResponse = await getAndParseHTML(client, homepageResponse.filteredURL, 'Notenspiegel');
            const scoreOptionsPageResponse = await getAndParseHTML(client, generalExamsPageResponse.filteredURL, 'Abschluss BA Bachelor');

            let $ = await fetchHTML(scoreOptionsPageResponse.filteredURL, client);

            const ul = $('ul.treelist').eq(1);
            const links = $(ul).find('li a[href]').attr('href');
            const course = $(ul).find('li span').html();


            /*res.json({
                links,
                course
            })*/

            //const url = $(link).attr('href');
            
            const response = await client.get(links);
            const html = response.data;

            $ = cheerio.load(html);
            
            const table = $('table').eq(1);
            const rows = $(table).find('tr');

            const tableData = [];
            $(rows).each((index, row) => {
                const cells = $(row).find('td').map((i, cell) => $(cell).text()).get();
                tableData.push(cells);
            })

            //const clearedTable = tableData.map(item => item.replace(/\t/g, '').replace(/\n/g, '').trim());
            const clearedTable = tableData.map(item => item.map(item2 => item2.replace(/\t/g, '').replace(/\n/g, '').trim()));
            
            console.log(clearedTable);
            res.send(clearedTable);
            
            //const response = await client.get(homepageUrl);
            /*
            const homepage = response.data;
            const $ = cheerio.load(homepage);
            const keyword = 'Meine Prüfungen';
            
            const filteredLinks = $('a').filter(function () {
                return $(this).text().includes(keyword);
            });

            // general exams (Link 1 clicked)
            const generalExamsURL = filteredLinks.first().attr('href');
            const generalExamsResponse = await client.get(generalExamsURL);
            const generalExamsPage = generalExamsResponse.data;
            
            const $1 = cheerio.load(generalExamsPage);
            const generalExamsPageKeyword = 'Notenspiegel';

            const gradesLink = $1('a').filter(function () {
                return $(this).text().includes(generalExamsPageKeyword);
            });

            const gradesURL = gradesLink.first().attr('href');

            console.log(gradesURL);
            
            // notenspiegel link
            const grades1Reponse = await client.get(gradesURL);
            const grades1Data = grades1Reponse.data;
            const $2 = cheerio.load(grades1Data);
            const grades2Keyword = 'Abschluss BA Bachelor';

            const grades2Link = $2('a').filter(function () {
                return $(this).text().includes(grades2Keyword);
            });

            const grades2URL = grades2Link.first().attr('href');

            // Abschluss BA Bachelor Link
            const grades2Response = await client.get(grades2URL);
            const grades2Data = grades2Response.data;
            //res.json({grades2Data});
            */

        } catch(error){
            console.log('Fehler beim Laden der Prüfungsergebnisse.', error);
        }
    }
}

module.exports = { loginToVSC, logoutFromVSC, testNav, getExamResults };