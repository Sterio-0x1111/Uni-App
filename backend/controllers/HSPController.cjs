require("dotenv").config();
const axios = require("axios");
const cheerio = require("cheerio");
const { wrapper } = require("axios-cookiejar-support");
const { CookieJar } = require("tough-cookie");

const loginToHSP = async (req, res) => {
    if (!req.session.loggedInHSP) {
        const { username, password } = req.body;
        const loginPageURL = process.env.HSP_LOGIN_URL;

        try {
            const cookieJar = new CookieJar();
            const client = wrapper(axios.create({ jar: cookieJar, withCredentials: true }));

            // Initiale GET-Anfrage
            const initialResponse = await client.get(loginPageURL);
            const $ = cheerio.load(initialResponse.data);

            // ViewState und Tokens extrahieren
            const viewState = $('input[name="javax.faces.ViewState"]').val();
            const authenticityToken = $('input[name="authenticity_token"]').val(); // Optional
            const ajaxToken = $('input[name="ajaxToken"]').val();

            // Login-Daten erstellen
            const loginData = new URLSearchParams();
            loginData.append("userInfo", "");
            loginData.append("ajax-token", ajaxToken);
            loginData.append("javax.faces.ViewState", viewState);
            loginData.append("asdf", username);
            loginData.append("fdsa", password);
            loginData.append("submit", "Anmelden");

            // POST-Anfrage zum Login
            const loginResponse = await client.post(
                "https://hochschulportal.fh-swf.de/qisserver/rds?state=user&type=1&category=auth.login",
                loginData.toString(),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "User-Agent": "Mozilla/5.0",
                        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                        Referer: loginPageURL,
                    },
                }
            );

            const html = loginResponse.data;

            // Prüfen, ob der Login erfolgreich war
            if (html.includes("Chiporello-Bild-Upload")) {
              // Session-Daten speichern
              req.session.loggedInHSP = true;
              req.session.user = { username };
              req.session.hspCookies = cookieJar;
              req.session.authenticityToken = authenticityToken;
              req.session.viewState = viewState;
              req.session.save();
              res.json({ message: "SUCCESS" });
            } else {
                res.status(401).json({ message: "FAILURE" });
            }
        } catch (error) {
            console.error("Failed to login to HSP:", error);
            res.status(500).json({ message: "Login failed", error: error.message });
        }
    } else {
        res.json({ message: "HSP: Bereits eingeloggt." });
    }
};

module.exports = { loginToHSP };