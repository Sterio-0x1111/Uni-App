const axios = require("axios");
const cheerio = require("cheerio");

// Hilfsfunktion zum Abrufen von HTML von einer URL
const fetchHTML = async (url) => {
  try {
    const response = await axios.get(url);
    return cheerio.load(response.data);
  } catch (error) {
    throw new Error(`Fehler beim Laden der Daten von ${url}: ${error.message}`);
  }
};

// Hilfsfunktion zur Fehlerbehandlung
const handleError = (res, message) => {
  console.error(message);
  res.status(500).json({ error: message });
};

// Hilfsfunktion zur Überprüfung der Erreichbarkeit eines Links
const checkLink = async (url) => {
  try {
    const response = await axios.get(url);
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

module.exports = { fetchHTML, handleError, checkLink };