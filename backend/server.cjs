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
const { createAxiosClient } = require('./utils/helpers.cjs')

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
 * Middleware zum Session Handling.
 * 
 * Diese Middleware erstellt ein CookieJar pro Benutzer 
 * und einen benutzerspezifischen Axios Client, 
 * sodass der Benutzer anfrageübergreifend eingeloggt bleibt.
*/
app.use((req, res, next) => {
    req.clientVSC = createAxiosClient(req, 'VSC'); // Virtuelles Service Center
    req.clientHSP = createAxiosClient(req, 'HSP'); // Hochschulportal
    req.clientVPIS = createAxiosClient(req, 'VPIS') // Vorlesungsplan Informationssystem

    next();
})

app.use(cors());
app.use(bodyParser.json()); // JSON-Body-Parsing aktivieren
app.use(bodyParser.urlencoded({ extended: true })); // URL-codierte Form-Daten unterstützen

app.use("/api/meals", require("./routes/meals.cjs"));
app.use("/api/mensa/options", require("./routes/meals.cjs"));
app.use('/api/hsp', require('./routes/HSP.cjs'));
app.use('/api/semester', require('./routes/semester.cjs'));

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

/**
 * Endpunkt zum Laden der Semestertermine.
*/ 
app.get('/api/semester', async (req, res) => {
    
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