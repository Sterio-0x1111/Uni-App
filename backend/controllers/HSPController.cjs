const cheerio = require('cheerio');

/***
 * Anmeldung im Hochschuloprtal.
 */
const loginToHSP = async (req, res) => {
    if (!req.session.loggedInHSP) {
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

            const html = loginResponse.data;

            // 4. Falls der Login erfolgreich war, sende das HTML als JSON zurück
            if (html.includes('Chiporello')) {
                req.session.loggedInHSP = true;
                console.log('HSP Login erfolgreich!');

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
    }
}

module.exports = { loginToHSP }