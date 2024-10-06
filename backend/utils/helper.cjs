const axios = require("axios");
const cheerio = require("cheerio");

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

module.exports = { fetchHTML, handleError };