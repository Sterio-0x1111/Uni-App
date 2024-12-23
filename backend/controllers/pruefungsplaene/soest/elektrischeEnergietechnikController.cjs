const { fetchHTML, handleError } = require("../../../utils/helpers.cjs");
const {
  extractInfoBoxText,
  extractPlans,
} = require("../../../utils/scrapeHelper.cjs");

// Funktion zum Scrapen der Prüfungsinformationen für Elektrische Energietechnik in Soest
const scrapeElektrischeEnergietechnik = async (req, res) => {
  try {
    const $ = await fetchHTML(
      "https://www.fh-swf.de/de/studierende/studienorganisation/pruefungsplaene/soest/fb_elektrische_energietechnik.php"
    );

    const infoboxes = extractInfoBoxText($, ".bubble-box__wrapper p"); // Extrahiert Infoboxen
    const plans = extractPlans($, ".accordion__wrapper .accordion__item"); // Extrahiert Prüfungspläne

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