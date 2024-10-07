const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const qs = require('qs');
const querystring = require('querystring');
const bodyParser = require("body-parser");

const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');
const { link } = require('fs');

const session = require('express-session');

const app = express();
const PORT = 3000; // auslagern in env

app.use(session({
    secret: 'geheimesSchlüsselwort',   // Ein geheimer Schlüssel, um die Session zu signieren
    resave: false,                     // Verhindert das Speichern von Session-Daten, wenn nichts geändert wurde
    saveUninitialized: false,          // Verhindert das Erstellen von Sessions, die nicht initialisiert sind
    cookie: { secure: false }          // Setze `secure: true`, wenn du HTTPS verwendest
}));

/**
 * Funktion zur Erstellung von Axios Clients.
 * 
 * Die Funktion wird aufgerufen, 
 * um die unterschiedlichen Clients 
 * für die verschiedenen Login Seiten zu erstellen.
 * */ 
function getAxiosClient(req, page){
    if(!req.session.client){
        req.session.clients = {};
    }

    if(!req.session.clients[page]){
        req.session.clients[page] = wrapper(axios.create({
            jar: new CookieJar(),   // Erstelle einen neuen CookieJar für die Seite
            withCredentials: true
        }));
    }

    return req.session.clients[page];
}

/**
 * Middleware zum Session Handling.
 * 
 * Diese Middleware erstellt ein CookieJar pro Benutzer 
 * und einen benutzerspezifischen Axios Client, 
 * sodass der Benutzer anfrageübergreifend eingeloggt bleibt.
*/
app.use((req, res, next) => {
    req.clientVSC = getAxiosClient(req, 'VSC'); // Virtuelles Service Center
    req.clientHSP = getAxiosClient(req, 'HSP'); // Hochschulportal
    req.clientVPIS = getAxiosClient(req, 'VPIS') // Vorlesungsplan Informationssystem

    next();
})

app.use(cors());
app.use(bodyParser.json()); // JSON-Body-Parsing aktivieren
app.use(bodyParser.urlencoded({ extended: true })); // URL-codierte Form-Daten unterstützen

/**
 * Endpujnkt zum Laden der Mensapläne.
 * 
 * Dieser Endpunkt wird vom Frontend aufgerufen 
 * und gibt hierbei einen Standort als URL Parameter mit.
 * Der entsprechende Plan wird geladen, geparst und aufbereitet 
 * und danach als JSON Format an das Frontend gesendet.
 */
app.get('/api/meals/:mensa/:date', async (req, res) => {
    try{
        const location = req.params.mensa.toLowerCase(); // Holt den Mensanamen aus der URL
        const date = req.params.date;
        const url = `https://www.stwdo.de/mensa-cafes-und-catering/fh-suedwestfalen/${location}/${date}`;
        
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        //const mealsTable = $('.meals tbody').html();
        const mealsTable = [];
        
        $('.meals tbody tr').each((index, element) => {
            //const categoryIcon = $(element).find('.meals__icon-category').attr('alt');
            const title = $(element).find('.meals__title').text().trim();
            const priceStudent = $(element).find('td:nth-child(4)').text().trim();
            const priceEmployee = $(element).find('td:nth-child(5)').text().trim();
            const priceGuest = $(element).find('td:nth-child(6)').text().trim();

            mealsTable.push({
                //categoryIcon,
                title,
                priceStudent,
                priceEmployee,
                priceGuest
            })
        })

        if(mealsTable.length > 0){
            res.json( { table: mealsTable } );
            console.log('Successfully send response!');
        } else {
            res.status(500).json( { err: 'Fehler! Daten wurden nicht gesendet!' } );
            console.log('Daten nicht gesendet!');
        }
    } catch(err){
        console.log('Fehler beim Laden der Daten.', err);
    }
});

// verfügbare Semester abrufen (vpisLogin)
app.get("/api/semesters", async (req, res) => {
  try {
    const response = await axios.get(
      "https://vpis.fh-swf.de/index.php/de/vpis/"
    );
    const $ = cheerio.load(response.data);

    const semesters = [];

    // Informationen für jedes Semester
    $(".news-teaser__item").each((i, element) => {
      const title = $(element).find(".headline--5").text().trim();
      const startDate = $(element)
        .find('span[itemprop="startDate"]')
        .first()
        .text()
        .trim();
      const endDate = $(element).find("span").last().text().trim();
      const link = $(element).find("a").attr("href");

      semesters.push({
        title: title,
        startDate: startDate,
        endDate: endDate,
        link: link,
      });
    });

    res.json(semesters); // Rückgabe der Semesterinformationen
  } catch (error) {
    console.error("Fehler beim Abrufen der Semester:", error);
    res.status(500).json({ error: "Fehler beim Abrufen der Semester." });
  }
});

app.get('/api/mensa/options/:loc', async (req, res) => {
    try {
        console.log('OPTIONS CALLED');
        const location = req.params.loc.toLowerCase();
        const url = `https://www.stwdo.de/mensa-cafes-und-catering/fh-suedwestfalen/${location}`;
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        const dateSelection = [];
        $('select').find('option').each((index, opt) => {
            const optionText = $(opt).text().trim();
            const optionValue = $(opt).attr('value');

            dateSelection.push({
                optionText,
                optionValue
            });
        });

        if(dateSelection.length > 0){
            res.json({ options: dateSelection });
            console.log('Successfully sent date selection options.');
        } else {
            res.status(500).json({ error: 'Failed to send date selection options.' });
        }

    } catch(error){
        console.error('Error while providing selection options.', error);
    }
})

/**
 * Endpunkt zum Laden der Semestertermine.
*/ 
app.get('/api/semester', async (req, res) => {
    try{
        const url = 'https://www.fh-swf.de/de/studierende/studienorganisation/vorlesungszeiten/vorlesungzeit.php';
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        const semesterTable = $('.table').first();
        semesterTable.find('thead').remove();
        
        const semesterList = [];

        semesterTable.find('tr').each((index, row) => {
            const columns = $(row).find('td');
            const semester = $(columns[0]).text(); // betreffendes Semester
            const period = $(columns[1]).text();  // Zeiträume

            semesterList.push({
                semester, 
                period
            })
        })
        
        if(semesterList.length > 0){
            res.json({ table: semesterList });
            console.log('Successfully sent semester periods.');
        } else {
            res.status(500).json({ err: 'Error. Data was not sent.' });
            console.log('Failed to send semester periods.');
        }
    } catch(err){
        console.log('Fehler beim Laden der Daten.', err);
    }
})

/***
 * Anmeldung im Hochschuloprtal.
 */
app.post('/api/hsp/login', async (req, res) => {

    const { username, password } = req.body;
    const url = 'https://hochschulportal.fh-swf.de/qisserver/pages/cs/sys/portal/hisinoneStartPage.faces';

    try {
        
        // 1. Sende eine GET-Anfrage, um die Seite zu laden und die Tokens zu extrahieren
        const initialResponse = await req.clientHSP.get(url);
        const $ = cheerio.load(initialResponse.data);

        // Extrahiere die notwendigen Tokens (z.B. javax.faces.ViewState, ajaxToken, authenticityToken)
        const viewState = $('input[name="javax.faces.ViewState"]').val();
        const ajaxToken = $('input[name="ajaxToken"]').val();
        const authenticityToken = $('input[name="authenticity_token"]').val();

        // 2. Bereite die Login-Daten als URL-encoded Form-Daten auf
        const loginData = new URLSearchParams();
        loginData.append('userInfo', ''); // Falls leer, kann optional sein
        loginData.append('ajax-token', ajaxToken);
        loginData.append('asdf', username);
        loginData.append('fdsa', password);
        loginData.append('submit', '');

        // 3. Sende den POST-Request zum Login mit den extrahierten Tokens
        const loginResponse = await req.clientHSP.post(
            'https://hochschulportal.fh-swf.de/qisserver/rds?state=user&type=1&category=auth.login',
            loginData.toString(), // URL-encoded Form-Daten
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/png,image/svg+xml,*/*;q=0.8',
                    'Accept-Language': 'de,en-US;q=0.7,en;q=0.3',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Sec-GPC': '1',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'same-origin',
                    'Sec-Fetch-User': '?1',
                    'Priority': 'u=0, i',
                    'Referer': 'https://hochschulportal.fh-swf.de/qisserver/pages/cs/sys/portal/hisinoneStartPage.faces',
                }
            }
        );

        // 4. Falls der Login erfolgreich war, sende das HTML als JSON zurück
        if (loginResponse.status === 200) {
            const html = loginResponse.data;
            console.log('Login erfolgreich!');
            
            // Sende die HTML-Daten als JSON
            // nach Bedarf anpassen
            res.json({
                message: 'SUCCESS',
                html
            })
        } else {
            console.error('Login fehlgeschlagen:', loginResponse.status);
            res.json({
                message: 'FAILURE'
            })
        }
    } catch (error) {
        console.error('Login to HSP failed.', error);
    }
})


// VSC APIs

app.post('/api/vsc/login', async (req, res) => {
    const { username, password } = req.body;
    const loginUrl = 'https://vsc.fh-swf.de/qisserver2/rds?state=user&type=1&category=auth.login&startpage=portal.vm&breadCrumbSource=portal';

    const loginPayload = new URLSearchParams();
    loginPayload.append('asdf', username);
    loginPayload.append('fdsa', password);
    loginPayload.append('submit', 'Anmelden');

    try {

        // Sende den POST-Request zum Login mit Cookies
        const response = await req.clientVSC.post(loginUrl, loginPayload.toString(), {
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

        const data = await response.data;
        res.json({ data });

    } catch(error){
        console.log('Failed to login to VSC.', error);
    }
})

app.get('/api/vsc/exams', async (req, res) => {
    try {



    } catch(error){
        console.log('Failed to send exam page.', error);
    }
})

app.get('/api/vsc/general', async (req, res) => {
    const loginUrl = 'https://vsc.fh-swf.de/qisserver2/rds?state=user&type=1&category=auth.login&startpage=portal.vm&breadCrumbSource=portal';
    const loginPayload = new URLSearchParams();
    loginPayload.append('asdf', 'emkoc003');
    loginPayload.append('fdsa', 'k9tX3ssP');
    loginPayload.append('submit', 'Anmelden');

    try {
        // Sende den POST-Request zum Login mit Cookies
        const response = await client.post(loginUrl, loginPayload.toString(), {
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

        if (response.status === 200) {
            console.log('Login erfolgreich!');
            
            const data = await response.data;
            const $ = cheerio.load(data);

            const links = {
                pruefungen: 'Meine Prüfungen',
                studium: 'Mein Studium',
                hilfe: 'Hilfe und Hinweise'
            }

            $('a').each((index, element) => {
                const elementText = $(element).text().trim();
                const key = Object.entries(links).find(([key, value]) => value === elementText)?.[0];

                if(key){
                    links[key] = $(element).attr('href');
                }
            })
            
            const x = await client.get(links.pruefungen);
            const dataX = x.data;
            const $2 = cheerio.load(dataX);

            const link = $2('a').filter((i, l) => $2(l).text().trim() === 'Notenspiegel');
            const urlNotenspiegel = link.attr('href');
            const y = await client.get(urlNotenspiegel);
            const dataY = await y.data;
            //res.json({data: dataY});

            const $3 = cheerio.load(dataY);
            const l3 = $3('ul.treelist a.regular');

            l3.each(async (index, link) => {
                const url3 = $(link).attr('href');
                
                const a = await client.get(url3);
                const dataA = await a.data;
                
                const $4 = cheerio.load(dataA);

                const link4 = $4('ul.treelist span + a').first();
                const url4 = link4.attr('href');

                const b = await client.get(url4);
                const dataB = await b.data;
                res.json({noten: dataB});

            })

            //res.json({ data: dataY });

           
        } else {
            console.error('Login fehlgeschlagen:', response.status);
        }
    } catch (error) {
        console.error('Fehler beim Login:', error.message);
    }
})

// weitere end points

app.listen(PORT, () => {
    console.log('Server läuft auf Port 3000.');
})