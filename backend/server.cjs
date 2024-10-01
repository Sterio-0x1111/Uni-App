const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const qs = require("qs");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;
app.use(cors());
app.use(bodyParser.json()); // JSON-Body-Parsing aktivieren
app.use(bodyParser.urlencoded({ extended: true })); // URL-codierte Form-Daten unterstützen

// Mensa Plan laden 
app.get('/api/meals/:mensa', async (req, res) => {
    try{
        console.log('Request');
        console.log(req.params.mensa);
        const loc = req.params.mensa.toLowerCase(); // Holt den Mensanamen aus der URL
        console.log(loc);
        const url = `https://www.stwdo.de/mensa-cafes-und-catering/fh-suedwestfalen/${loc}`;
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        const mealsTable = $('.meals').html();
        console.log(mealsTable);
        if(mealsTable){
            res.json( { table: mealsTable } );
            console.log('Successfully send response!');
        } else {
            res.status(500).json( { err: 'Fehler! Daten wurden nicht gesendet!' } );
            console.log('Daten nicht gesendet!');
        }
    } catch(err){
        console.log('Fehler beim Laden der Daten.', err);
    }
})

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("Received username:", username);
  console.log("Received password:", password);
  
  try {
    // 1. Lade die Login-Seite, um versteckte Felder und Cookies zu erhalten
    const loginPageResponse = await axios.get(
      "https://hochschulportal.fh-swf.de/qisserver/pages/cs/sys/portal/hisinoneStartPage.faces"
    );
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
        "ajax-token": ajaxToken,
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
    console.error("Fehler beim Login oder Scraping:", error);
    res.status(500).json({ error: "Fehler beim Abrufen der Daten." });
  }
});

// weitere end points

app.listen(PORT, () => {
    console.log('Server läuft auf Port 3000.');
})