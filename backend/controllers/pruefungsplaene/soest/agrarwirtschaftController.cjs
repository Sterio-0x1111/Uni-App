const { fetchHTML, handleError } = require("../../../utils/helpers.cjs");
const { extractInfoBoxText, extractPlans } = require("../../../utils/scrapeHelper.cjs");

// Scrape-Funktion für Prüfungsinformationen Agrarwirtschaft in Soest
const scrapeAgrarwirtschaft = async (req, res) => {
  try {
    const $ = await fetchHTML(
      "https://www.fh-swf.de/de/studierende/studienorganisation/pruefungsplaene/soest/pruefungsplaene_3.php"
    );

    const infoBox = extractInfoBoxText(
      $,
      ".bubble-box__wrapper .list-wrapper__item"
    ); // Infobox-Daten extrahieren
    const bachelorPlans = extractPlans(
      $,
      ".accordion .accordion__wrapper .accordion__item"
    ); // Bachelorpläne extrahieren
    const masterPlans = extractPlans(
      $,
      ".accordion:last-of-type .accordion__wrapper .accordion__item"
    ); // Masterpläne extrahieren

    res.json({
      infoBox,
      bachelorPlans,
      masterPlans,
    });
  } catch (error) {
    handleError(
      res,
      `Fehler beim Scraping der Agrarwirtschafts-Prüfungsinformationen: ${error.message}`
    );
  }
};

module.exports = { scrapeAgrarwirtschaft };
