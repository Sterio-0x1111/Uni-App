const { fetchHTML, handleError } = require("../../../utils/helpers.cjs");

const scrapeInformatikNaturwissenschaft = async (req, res) => {
  try {
    const $ = await fetchHTML("https://www.fh-swf.de/de/studierende/studienorganisation/pruefungsplaene/iserlohn/index.php");
    const courses = [];

    // Scrape die Studiengang-Links
    $(".bubble-box__wrapper .list-wrapper__item").each((i, element) => {
      const name = $(element).find(".link__text").text().trim();
      const link = $(element).find("a").attr("href");
      const isVerbund = name.toLowerCase().includes("verbund"); // Prüfen auf Verbundstudiengang

      const course = {
        name,
        link: link.startsWith("http") ? link : `https://www.fh-swf.de${link}`,
        isVerbundstudiengang: isVerbund || false,
      };

      courses.push(course);
    });

    res.json({ courses });
  } catch (error) {
    handleError(
      res,
      `Fehler beim Scraping der Informatik und Naturwissenschaften Prüfungsinformationen: ${error.message}`
    );
  }
};

module.exports = { scrapeInformatikNaturwissenschaft };