const { fetchHTML, handleError } = require("../../../utils/helpers.cjs");
const { extractUnifiedData } = require("../../../utils/scrapeUnifiedData.cjs");

const scrapeBildungsGesellschafts = async (req, res) => {
  try {
    const url = "https://www.fh-swf.de/de/studierende/studienorganisation/pruefungsplaene/soest/pruefungsplaene_4.php";
    const $ = await fetchHTML(url);

    const unifiedData = await extractUnifiedData($, {
      contentSelector: "div.bubble-box__wrapper.marginal.bs.mb--16.lg-mb--24.bs:not(.theme--inverted)",
      planSelector: ".accordion .accordion__wrapper .accordion__item, .container.mb--64.lg-mb--120 .accordion__item"
    });

    res.json(unifiedData);
  } catch (error) {
    handleError(res, `Fehler beim Scraping der Bildungs- und Gesellschaftswissenschaften-Prüfungsinformationen: ${error.message}`);
  }
};

module.exports = { scrapeBildungsGesellschafts };