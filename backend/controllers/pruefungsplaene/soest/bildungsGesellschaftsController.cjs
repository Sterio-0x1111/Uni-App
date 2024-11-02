const { fetchHTML, handleError } = require("../../../utils/helpers.cjs");
const { extractInfoBoxText, extractPlans } = require("../../../utils/scrapeHelper.cjs");

// Scrape-Funktion für Prüfungsinformationen Bildungs- und Gesellschaftswissenschaften in Soest
const scrapeBildungsGesellschafts = async (req, res) => {
  try {
    const $ = await fetchHTML(
      "https://www.fh-swf.de/de/studierende/studienorganisation/pruefungsplaene/soest/pruefungsplaene_4.php"
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
      `Fehler beim Scraping der Bildungs- und Gesellschaftswissenschaften-Prüfungsinformationen: ${error.message}`
    );
  }
};

module.exports = { scrapeBildungsGesellschafts };
