const { fetchHTML, handleError } = require("../../../utils/helpers.cjs");

const scrapeMaschinenbau = async (req, res) => {
  try {
    const $ = await fetchHTML("https://www.fh-swf.de/de/studierende/studienorganisation/pruefungsplaene/iserlohn/pruefungsplaene_1.php");

    const praesenzStudiengaenge = [];
    const verbundStudiengaenge = [];

    // Präsenzstudiengänge
    $(".bubble-box__wrapper .list-wrapper__item").each((i, element) => {
      const name = $(element).find(".link__text").text().trim();
      const link = $(element).find("a").attr("href");

      praesenzStudiengaenge.push({
        name,
        link: link.startsWith("http") ? link : `https://www.fh-swf.de${link}`,
      });
    });

    // Verbundstudiengänge
    $(".accordion__item").each((i, element) => {
      const name = $(element).find(".headline--3").text().trim();
      const link = $(element).find(".wysiwyg a").attr("href");

      verbundStudiengaenge.push({
        name,
        link: link
          ? link.startsWith("http")
            ? link
            : `https://www.fh-swf.de${link}`
          : "N/A",
        additionalInfo: "Anmeldung auf Moodle erforderlich",
      });
    });

    res.json({ praesenzStudiengaenge, verbundStudiengaenge });
  } catch (error) {
    handleError(
      res,
      `Fehler beim Scraping der Maschinenbau-Prüfungsinformationen: ${error.message}`
    );
  }
};

module.exports = { scrapeMaschinenbau };