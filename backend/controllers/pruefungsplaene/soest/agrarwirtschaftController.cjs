const axios = require("axios");
const cheerio = require("cheerio");
const { handleError } = require("../../../utils/helpers.cjs");

// Scrape-Funktion für Prüfungsinformationen Agrarwirtschaft in Soest
const scrapeAgrarwirtschaft = async (req, res) => {
  try {
    const response = await axios.get(
      "https://www.fh-swf.de/de/studierende/studienorganisation/pruefungsplaene/soest/pruefungsplaene_3.php"
    );
    const $ = cheerio.load(response.data);

    // Infobox-Daten sammeln
    const infoBox = $(".bubble-box__wrapper .list-wrapper__item")
      .map((i, element) => {
        return $(element).text().trim();
      })
      .get();

    // Bachelor Prüfungspläne sammeln
    const bachelorPlans = [];
    $(".accordion .accordion__wrapper .accordion__item").each((i, item) => {
      const title = $(item).find(".accordion__head-content h3").text().trim();
      const plans = [];
      $(item)
        .find(".accordion__body-inner a")
        .each((j, link) => {
          const planTitle = $(link).text().trim();
          const planUrl = `https://www.fh-swf.de${$(link).attr("href")}`;
          plans.push({ title: planTitle, url: planUrl });
        });
      bachelorPlans.push({ title, plans });
    });

    // Master Prüfungspläne sammeln
    const masterPlans = [];
    $(".accordion:last-of-type .accordion__wrapper .accordion__item").each(
      (i, item) => {
        const title = $(item).find(".accordion__head-content h3").text().trim();
        const plans = [];
        $(item)
          .find(".accordion__body-inner a")
          .each((j, link) => {
            const planTitle = $(link).text().trim();
            const planUrl = `https://www.fh-swf.de${$(link).attr("href")}`;
            plans.push({ title: planTitle, url: planUrl });
          });
        masterPlans.push({ title, plans });
      }
    );

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