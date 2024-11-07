const axios = require("axios");
const cheerio = require("cheerio");
const qs = require("qs");
const { handleError } = require("../utils/helpers.cjs");

// Hochschulportal
const loginToHochschulportal = async (req, res) => {
  const { username, password } = req.body; // env muss noch angepasst werden (in Arbeit)
  console.log("Received username:", username);
  console.log("Received password:", password);

  try {
    // 1. Lade die Login-Seite, um versteckte Felder und Cookies zu erhalten
    const HOCHSCHULPORTAL_URL = process.env.HOCHSCHULPORTAL_URL; // env
    const loginPageResponse = await axios.get(HOCHSCHULPORTAL_URL);
    const cookies = loginPageResponse.headers["set-cookie"];
    const $ = cheerio.load(loginPageResponse.data);

    const viewState = $('input[name="javax.faces.ViewState"]').val();
    const authenticityToken = $('input[name="authenticity_token"]').val();
    const ajaxToken = $('input[name="ajax-token"]').val();

    // 2. Login Request senden mit Benutzername, Passwort und versteckten Feldern
    const loginResponse = await axios.post(
      "https://hochschulportal.fh-swf.de/qisserver/rds?state=user&type=1&category=auth.login",
      qs.stringify({
        asdf: username,
        fdsa: password,
        "javax.faces.ViewState": viewState,
        authenticity_token: authenticityToken,
        ajaxToken: ajaxToken, // ajax-token
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: cookies, // Cookies vom ersten Request weitergeben
        },
      }
    );

    // 3. Überprüfung des Erfolgs
    if (loginResponse.data.includes("Erfolgreich angemeldet")) {
      res.json({ message: "Login erfolgreich!" });
    } else {
      res
        .status(401)
        .json({ error: "Login fehlgeschlagen. Ungültige Anmeldedaten." });
    }
  } catch (error) {
    handleError(res, `Fehler beim Login: ${error.message}`);
  }
};

module.exports = { loginToHochschulportal };