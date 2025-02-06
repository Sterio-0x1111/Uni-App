const { fetchHTML, handleError } = require("../../../utils/helpers.cjs");
const { extractUnifiedData } = require("../../../utils/scrapeUnifiedData.cjs");

const scrapeAgrarwirtschaft = async (req, res) => {
  try {
    const url = "https://www.fh-swf.de/de/studierende/studienorganisation/pruefungsplaene/soest/pruefungsplaene_3.php";
    const $ = await fetchHTML(url);

    const unifiedData = await extractUnifiedData($, {
      contentSelector: "div.bubble-box__wrapper.marginal.bs.mb--16.lg-mb--24.bs:not(.theme--inverted)",
      planSelector: ".accordion .accordion__wrapper .accordion__item",
    });

    if (
      unifiedData.infoBoxes.length === 0 &&
      unifiedData.plans.length === 0 &&
      !unifiedData.courses
    ) {
      return res.status(404).json({ message: "Keine Inhalte gefunden." });
    }
    res.json(unifiedData);
  } catch (error) {
    handleError(res, `Fehler beim Scraping der Agrarwirtschafts-Informationen: ${error.message}`);
  }
};

module.exports = { scrapeAgrarwirtschaft };