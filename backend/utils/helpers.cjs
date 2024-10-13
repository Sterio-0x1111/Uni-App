const axios = require("axios");
const cheerio = require("cheerio");
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

// Utility function to fetch HTML from a URL
const fetchHTML = async (url, client = axios) => {
  try {
    const response = await client.get(url);
    return cheerio.load(response.data);
  } catch (error) {
    throw new Error(`Fehler beim Laden der Daten von ${url}: ${error.message}`);
  }
};

// Utility function for error handling
const handleError = (res, message) => {
  console.error(message);
  res.status(500).json({ error: message });
};

/**
 * Funktion zur Erstellung von Axios Clients.
 * 
 * Die Funktion wird aufgerufen, 
 * um die unterschiedlichen Clients 
 * für die verschiedenen Login Seiten zu erstellen.
 * */
const createAxiosClient = (cookieJar) => {
  return wrapper(axios.create({
    jar: cookieJar || new CookieJar(),   // Übergib den CookieJar aus der Session
    withCredentials: true
  }));
};

const deserializeCookieJar = cookieJar => {
  return (typeof cookieJar === 'object' && !(cookieJar instanceof CookieJar)) ? CookieJar.deserializeSync(cookieJar) : cookieJar;
}

/*
            Ablauf des Parsings der Noten (in Funktion auslagern)
            1) URL 
            2) GET auf URL mit Client
            3) HTML Page der Response laden
            4) HTML Seite in Cheerio laden
            5) Keyword für Filterung festlegn (Notenspiegel, bmelden...)
            6) Links filtern
            7) richtigen Link (meistens der erste) aus gefilterter Menge ziehen
            8) wiederholen mit nächster Seite

            Benötigte Parameter:
            1) client
            2) keyword
            3) url

            Rückgabe:
            - gefilterte URL für nächste Seite
        */
const getAndParseHTML = async (client, url, keyword, tag = 'a', attribute = 'href') => {
  const response = await client.get(url);
  const html = response.data;
  const $ = cheerio.load(html);

  const filteredLinks = $(tag).filter(function () {
    return $(this).text().includes(keyword);
  });
  //console.log(filteredLinks);

  const filteredURL = filteredLinks.first().attr('href');
  return {
    filteredURL,
    html
  };
}

module.exports = { fetchHTML, handleError, createAxiosClient, deserializeCookieJar, getAndParseHTML };