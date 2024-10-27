const axios = require("axios");
const cheerio = require("cheerio");
const { handleError } = require("../../../utils/helpers.cjs");

// Scrape-Funktion für Prüfungsinformationen Maschinenbau-Automatisierungstechnik in Soest
const scrapeMaschinenbauAutomatisierung = async (req, res) => {
  try {
    const response = await axios.get(
      "https://www.fh-swf.de/de/studierende/studienorganisation/pruefungsplaene/soest/index.php"
    );
    const $ = cheerio.load(response.data);

    // Infobox-Daten sammeln
    const infoBox = [];
    $(".bubble-box__wrapper")
      .find("p")
      .each((i, element) => {
        const text = $(element).text().trim();
        if (text) {
          infoBox.push(text);
        }
      });

    // Prüfungspläne sammeln
    const pruefungsplaene = [];
    $(".accordion__wrapper .accordion__item").each((i, item) => {
      const title = $(item).find(".accordion__head-content h3").text().trim();
      const plans = [];
      $(item)
        .find(".accordion__body-inner a")
        .each((j, link) => {
          const planTitle = $(link).text().trim();
          const planUrl = `https://www.fh-swf.de${$(link).attr("href")}`;
          plans.push({ title: planTitle, url: planUrl });
        });
      pruefungsplaene.push({ title, plans });
    });

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