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
const createAxiosClient = (req, page) => {
  if (!req.session.client) {
    req.session.clients = {};
  }

  if (!req.session.clients[page]) {
    req.session.clients[page] = wrapper(axios.create({
      jar: new CookieJar(),   // Erstelle einen neuen CookieJar für die Seite
      withCredentials: true
    }));
  }

  return req.session.clients[page];
}

module.exports = { fetchHTML, handleError, createAxiosClient };