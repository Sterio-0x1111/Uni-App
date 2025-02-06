require("dotenv").config();
const cheerio = require("cheerio");
const { createAxiosClient } = require("../../utils/helpers.cjs");
const { CookieJar } = require("tough-cookie");

const loginToHSP = async (req, res) => {
    if (!req.session.loggedInHSP) {
        const { username, password } = req.body;
        const loginPageURL = process.env.HSP_LOGIN_URL;

        try {
            const cookieJar = new CookieJar();
            const client = createAxiosClient(cookieJar);

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

const logoutFromHSP = async (req, res) => {
  if (req.session.loggedInHSP) {
    const client = createAxiosClient(req.session.hspCookies);

    const url = process.env.HSP_LOGIN_URL;
    const response = await client.get(url);
    const initialData = response.data;
    const $ = cheerio.load(response.data);

    const filteredLinks = $("a").filter(function () {
      return $(this).text().includes("bmelden");
    });

    const logoutURL = "https://hochschulportal.fh-swf.de" + filteredLinks.first().attr("href");

    try {
      const response = await client.get(logoutURL);
      const data = response.data;

      if (data.includes("sukzessive")) {
        console.log("HSP: Erfolgreich ausgeloggt.");
        req.session.loggedInHSP = false;
        req.session.hspCookies = undefined;

        res.status(200).json({ data });
      } else {
        console.log("Logout fehlgeschlagen.");
        res.status(500).json({ message: "HSP Logout fehlgeschlagen." });
      }
    } catch (error) {
      console.log("HSP: Fehler beim Ausloggen.\n", error);
      res.status(500).json({ data: initialData });
    }
  } else {
    res.status(200).json({ message: "HSP bereits ausgeloggt." });
  }
};

module.exports = { loginToHSP, logoutFromHSP };