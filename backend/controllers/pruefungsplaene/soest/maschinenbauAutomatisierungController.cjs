const { fetchHTML, handleError } = require("../../../utils/helpers.cjs");
const { extractInfoBoxText, extractPlans } = require("../../../utils/scrapeHelper.cjs");

// Scrape-Funktion für Prüfungsinformationen Maschinenbau-Automatisierungstechnik in Soest
const scrapeMaschinenbauAutomatisierung = async (req, res) => {
  try {
    const $ = await fetchHTML(
      "https://www.fh-swf.de/de/studierende/studienorganisation/pruefungsplaene/soest/index.php"
    );

    const infoBox = extractInfoBoxText($, ".bubble-box__wrapper p"); // Infobox-Daten extrahieren
    const pruefungsplaene = extractPlans($, ".accordion__wrapper .accordion__item"); // Prüfungspläne extrahieren

    res.json({
      infoBox,
      pruefungsplaene,
    });
  } catch (error) {
    handleError(
      res,
      `Fehler beim Scraping der Maschinenbau-Automatisierungstechnik Prüfungsinformationen: ${error.message}`
    );
  }
};

module.exports = { scrapeMaschinenbauAutomatisierung };