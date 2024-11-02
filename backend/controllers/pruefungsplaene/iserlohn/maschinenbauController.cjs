const { scrapeCourses } = require("../../../utils/scrapeHelper.cjs");
const { handleError } = require("../../../utils/helpers.cjs");

const scrapeMaschinenbau = async (req, res) => {
  try {
    const result = await scrapeCourses(
      "https://www.fh-swf.de/de/studierende/studienorganisation/pruefungsplaene/iserlohn/pruefungsplaene_1.php"
    );
    res.json(result);
  } catch (error) {
    handleError(
      res,
      `Fehler beim Scraping der Maschinenbau-Prüfungsinformationen: ${error.message}`
    );
  }
};

module.exports = { scrapeMaschinenbau };