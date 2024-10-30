const { fetchHTML, handleError, extractInfoBoxText, extractPlans } = require("../../../utils/helpers.cjs");

// Scrape-Funktion für Prüfungsinformationen Elektrische Energietechnik in Soest
const scrapeElektrischeEnergietechnik = async (req, res) => {
  try {
    const $ = await fetchHTML(
      "https://www.fh-swf.de/de/studierende/studienorganisation/pruefungsplaene/soest/fb_elektrische_energietechnik.php"
    );

    const infoboxes = extractInfoBoxText($, ".bubble-box__wrapper p"); // Infoboxen extrahieren
    const plans = extractPlans($, ".accordion__wrapper .accordion__item"); // Prüfungspläne extrahieren

    res.json({
      infoboxes,
      plans,
    });
  } catch (error) {
    handleError(
      res,
      `Fehler beim Scraping der Elektrische Energietechnik-Prüfungsinformationen: ${error.message}`
    );
  }
};

module.exports = { scrapeElektrischeEnergietechnik };