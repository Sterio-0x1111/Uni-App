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
});

// Hochschulportal
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
    console.log(loginPageResponse);
    console.log(cookies);

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

// Login für VPIS
app.post("/api/vpisLogin", async (req, res) => {
  const { username, password, semester } = req.body;

  try {
    // 1. Lade die Login-Seite, um Cookies und versteckte Felder zu holen
    const loginPageResponse = await axios.get(
      "https://vpis.fh-swf.de/index.php/de/vpis/"
    );
    const cookies = loginPageResponse.headers["set-cookie"];

    // Lade die Seite in Cheerio, um versteckte Felder zu extrahieren
    const $ = cheerio.load(loginPageResponse.data);

    // 2. Login-Request
    const loginResponse = await axios.post(
      `https://vpis.fh-swf.de/${semester}/student.php3`, // Dynamischer Semesterlink (in Arbeit)
      qs.stringify({
        benutzerkennung: username, // Benutzerkennung-Feld
        passwd: password, // Passwort-Feld
        // Weitere versteckte Felder (wenn geg.)
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: cookies, // Weitergabe für Cookies
        },
      }
    );

    // 3. Überprüfen, ob der Login erfolgreich war
    if (loginResponse.data.includes("Erfolgreich angemeldet")) {
      // Erfolgreicher Login
      const dataPageResponse = await axios.get(
        `https://vpis.fh-swf.de/${semester}/student.php3?Template=2021`,
        {
          headers: {
            Cookie: loginResponse.headers["set-cookie"],
          },
        }
      );

      const $ = cheerio.load(dataPageResponse.data);
      const personalData = [];

      // Scraping
      $(".info-element").each((i, element) => {
        personalData.push($(element).text().trim());
      });

      res.json(personalData); // Gescrapete Daten zurückgeben
    } else {
      res.status(401).json({ error: "Login fehlgeschlagen." });
    }
  } catch (error) {
    console.error("Fehler beim Login oder Scraping:", error.message, error.response?.data);
    res.status(500).json({ error: "Fehler beim Abrufen der Daten." });
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

// weitere end points

app.listen(PORT, () => {
    console.log('Server läuft auf Port 3000.');
})