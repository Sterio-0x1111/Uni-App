const { scrapeCourses } = require("../../../utils/scrapeHelper.cjs");
const { handleError } = require("../../../utils/helpers.cjs");

const scrapeInformatikNaturwissenschaft = async (req, res) => {
  try {
    const result = await scrapeCourses(
      "https://www.fh-swf.de/de/studierende/studienorganisation/pruefungsplaene/iserlohn/index.php"
    );
    res.json(result);
  } catch (error) {
    handleError(
      res,
      `Fehler beim Scraping der Informatik und Naturwissenschaften Prüfungsinformationen: ${error.message}`
    );
  }
};

module.exports = { scrapeInformatikNaturwissenschaft };