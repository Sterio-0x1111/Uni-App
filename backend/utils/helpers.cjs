const axios = require("axios");
const cheerio = require("cheerio");
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

// Utility function to fetch HTML from a URL
const fetchHTML = async (url) => {
  try {
    const response = await axios.get(url);
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
  return (typeof cookieJar === 'object' && !(cookieJar instanceof CookieJar )) ? CookieJar.deserializeSync(cookieJar) : cookieJar;
}

module.exports = { fetchHTML, handleError, createAxiosClient, deserializeCookieJar };