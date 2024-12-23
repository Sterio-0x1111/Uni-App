const { fetchHTML, handleError } = require("../../../utils/helpers.cjs");
const { extractInfoBoxText, extractPlans } = require("../../../utils/scrapeHelper.cjs");

// Funktion zum Scrapen der Prüfungsinformationen für Bildungs- und Gesellschaftswissenschaften in Soest
const scrapeBildungsGesellschafts = async (req, res) => {
  try {
    const $ = await fetchHTML(
      "https://www.fh-swf.de/de/studierende/studienorganisation/pruefungsplaene/soest/pruefungsplaene_4.php"
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
      `Fehler beim Scraping der Bildungs- und Gesellschaftswissenschaften-Prüfungsinformationen: ${error.message}`
    );
  }
};

module.exports = { scrapeBildungsGesellschafts };