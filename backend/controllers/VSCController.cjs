const { fetchHTML, handleError } = require("../utils/helpers.cjs");
const axios = require('axios');
const cheerio = require('cheerio');

// axios clients in session speichern, homepage nicht notwendig
let homepage = '';
let client = undefined;

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
            client = req.clientVSC;
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
                homepage = data;
            }

            res.json({ data });

        } catch (error) {
            console.log('Failed to login to VSC.', error);
        }
    } else {
        res.json({ message: 'VSC: Bereits eingeloggt.' });
    }
}

const logoutFromVSC = async (req, res) => {
    if (req.session.loggedInVSC) {
        //const url = 'https://vsc.fh-swf.de/';

        const $ = cheerio.load(homepage);

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
            } else {
                console.log('Logout fehlgeschlagen.');
            }

            res.json({ data });

        } catch (error) {
            console.log('VSC: Fehler beim Ausloggen.\n', error);
        }
    }
}

const testNav = async (req, res) => {
    try {
        const response = await client.get('https://vsc.fh-swf.de/qisserver2/rds?state=user&type=0');
        const data = response.data;
        res.json({data});
    } catch(error){
        
    }
}

module.exports = { loginToVSC, logoutFromVSC, testNav };