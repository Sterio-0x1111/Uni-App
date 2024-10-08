const { fetchHTML, handleError } = require("../utils/helpers.cjs");
const axios = require('axios');
const cheerio = require('cheerio');

const loginToVSC = async (req, res) => {
    const { username, password } = req.body;
    const loginPageURL = 'https://vsc.fh-swf.de/qisserver2/rds?state=user&type=1&category=auth.login&startpage=portal.vm&breadCrumbSource=portal';

    const loginPayload = new URLSearchParams();
    loginPayload.append('asdf', username);
    loginPayload.append('fdsa', password);
    loginPayload.append('submit', 'Anmelden');
    
    try {
        // Sende den POST-Request zum Login mit Cookies
        const response = await req.clientVSC.post(loginPageURL, loginPayload.toString(), {
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
        res.json({ data });

    } catch (error) {
        console.log('Failed to login to VSC.', error);
    }
}

module.exports = { loginToVSC };