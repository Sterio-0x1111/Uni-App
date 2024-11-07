const axios = require("axios");
const cheerio = require("cheerio");
const qs = require("qs");
const { fetchHTML, handleError, checkLink } = require("../utils/helpers.cjs");
const VPIS_LOGIN_URL = process.env.VPIS_LOGIN_URL;
const SEMESTER_ARCHIV = process.env.SEMESTER_ARCHIV;

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

// Funktion zum Abrufen der aktuellen Semester
const getSemesters = async (req, res) => {
  try {
    const $ = await fetchHTML("https://vpis.fh-swf.de/index.php/de/vpis/vpis_semester_archiv.php");
    let semesters = await extractSemesters($);
    semesters = await addNewerSemester(semesters); // Aufruf von `addNewerSemester` mit `await`

    res.json(semesters); // Rückgabe der Semesterinformationen
  } catch (error) {
    handleError(res, `Fehler beim Abrufen der Semester: ${error.message}`);
  }
};

// Hilfsfunktion zum Extrahieren der Semesterinformationen und Überprüfung der Links
const extractSemesters = async ($) => {
  const items = $(".list-wrapper__item").map(async (i, element) => {
    const title = $(element).find(".link__text").text().trim();
    let link = $(element).find("a").attr("href");

    if (link && !link.startsWith("http")) {
      link = `https://www.fh-swf.de${link}`;
    }

    const isAccessible = await checkLink(link);
    return { title, link, isAccessible };
  }).get();

  return await Promise.all(items);
};

// Funktion zum Hinzufügen des nächsten Semesters
const addNewerSemester = async (semesters) => {
  const latestSemester = semesters[0];

  if (latestSemester) {
    let nextSemesterTitle, nextSemesterLink;

    if (latestSemester.title.startsWith("WS")) {
      const yearMatch = latestSemester.title.match(/(\d{4})\/(\d{4})/);
      if (yearMatch) {
        const startYear = parseInt(yearMatch[1], 10);
        nextSemesterTitle = `SS${startYear + 1}`;
        nextSemesterLink = latestSemester.link.replace(/WS\d{4}/, `SS${startYear + 1}`);
      }
    } else if (latestSemester.title.startsWith("SS")) {
      const year = parseInt(latestSemester.title.match(/\d{4}/)[0], 10);
      nextSemesterTitle = `WS${year}/${year + 1}`;
      nextSemesterLink = latestSemester.link.replace(/SS\d{4}/, `WS${year}`);
    }

    if (nextSemesterTitle && nextSemesterLink) {
      const isAccessible = await checkLink(nextSemesterLink);

      semesters.unshift({
        title: nextSemesterTitle,
        link: nextSemesterLink,
        isAccessible,
      });
    }
  }

  return semesters;
};

module.exports = { loginToVPIS, getSemesters };