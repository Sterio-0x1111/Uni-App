const { fetchHTML, handleError } = require("../../../utils/helpers.cjs");
const { extractUnifiedData } = require("../../../utils/scrapeUnifiedData.cjs");

const scrapeElektrischeEnergietechnik = async (req, res) => {
  try {
    const url = "https://www.fh-swf.de/de/studierende/studienorganisation/pruefungsplaene/soest/fb_elektrische_energietechnik.php";
    const $ = await fetchHTML(url);

    const unifiedData = await extractUnifiedData($, {
      contentSelector: "div.bubble-box__wrapper.marginal.bs.mb--16.lg-mb--24.bs:not(.theme--inverted)",
      planSelector: ".accordion .accordion__wrapper .accordion__item"
    });

    res.json(unifiedData);
  } catch (error) {
    handleError(res, `Fehler beim Scraping der Elektrische Energietechnik-Prüfungsinformationen: ${error.message}`);
  }
};

module.exports = { scrapeElektrischeEnergietechnik };