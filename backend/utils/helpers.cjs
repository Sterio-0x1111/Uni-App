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

// Funktion zum Extrahieren von Infobox-Daten
const extractInfoBoxText = ($, selector) => {
  return $(selector)
    .map((i, element) => $(element).text().trim())
    .get();
};

// Funktion zum Extrahieren von Prüfungsplänen
const extractPlans = ($, selector) => {
  const plans = [];
  $(selector).each((i, item) => {
    const title = $(item).find(".accordion__head-content h3").text().trim();
    const planLinks = [];
    $(item)
      .find(".accordion__body-inner a")
      .each((j, link) => {
        const planTitle = $(link).text().trim();
        const planUrl = `https://www.fh-swf.de${$(link).attr("href")}`;
        planLinks.push({ title: planTitle, url: planUrl });
      });
    if (title && planLinks.length > 0) {
      plans.push({ title, plans: planLinks });
    }
  });
  return plans;
};

module.exports = { fetchHTML, handleError, extractInfoBoxText, extractPlans };