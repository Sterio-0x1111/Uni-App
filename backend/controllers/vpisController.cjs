const axios = require("axios");
const cheerio = require("cheerio");
const qs = require("qs");
const { fetchHTML, handleError } = require("../utils/helpers.cjs");
const VPIS_LOGIN_URL = process.env.VPIS_LOGIN_URL;

// Login für VPIS
const loginToVPIS = async (req, res) => {
  const { username, password, semester } = req.body;

  try {
    // 1. Lade die Login-Seite, um Cookies und versteckte Felder zu holen
    const loginPageResponse = await axios.get(VPIS_LOGIN_URL);
    const cookies = loginPageResponse.headers["set-cookie"];

    // Lade die Seite in Cheerio, um versteckte Felder zu extrahieren
    const $ = cheerio.load(loginPageResponse.data);

    // 2. Login-Request
    const loginResponse = await axios.post(
      `https://vpis.fh-swf.de/${semester}/student.php3`, // Dynamischer Semesterlink
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
    handleError(res, `Fehler beim Login: ${error.message}`);
  }
};

// verfügbare Semester abrufen (vpisLogin)
const getSemesters = async (req, res) => {
  try {
    const $ = await fetchHTML(VPIS_LOGIN_URL);

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
    handleError(res, `Fehler beim Abrufen der Semester: ${error.message}`);
  }
};

module.exports = { loginToVPIS, getSemesters };