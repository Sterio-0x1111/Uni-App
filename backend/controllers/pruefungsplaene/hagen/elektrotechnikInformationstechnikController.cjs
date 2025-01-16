const { fetchHTML, handleError } = require("../../../utils/helpers.cjs");
const { extractUnifiedData } = require("../../../utils/scrapeUnifiedData.cjs");

// Funktion zum Scrapen der Hinweise und Prüfungsplanlinks für Elektrotechnik und Informationstechnik in Hagen
const scrapeElektrotechnikInformationstechnik = async (req, res) => {
  try {
    const url = "https://www.fh-swf.de/de/studierende/studienorganisation/pruefungsplaene/hagen_1/index~1.php";
    const $ = await fetchHTML(url);

    // Wir definieren hier den contentSelector, damit sämtliche Inhalte aus dem Artikel (z. B. Überschriften, Absätze, Listen) extrahiert werden.
    const unifiedData = await extractUnifiedData($, {
      contentSelector: "article.wysiwyg",
      planSelector: ".accordion .accordion__wrapper .accordion__item",
    });

    // Falls keine Inhalte gefunden wurden:
    if (
      unifiedData.infoBoxes.length === 0 &&
      unifiedData.plans.length === 0 &&
      !unifiedData.courses
    ) {
      return res.status(404).json({ message: "Keine Inhalte gefunden." });
    }

    res.json(unifiedData);
  } catch (error) {
    handleError(res, `Fehler beim Scraping der Inhalte: ${error.message}`);
  }
};

module.exports = { scrapeElektrotechnikInformationstechnik };