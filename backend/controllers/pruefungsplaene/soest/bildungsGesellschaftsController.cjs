const axios = require("axios");
const cheerio = require("cheerio");
const { handleError } = require("../../../utils/helpers.cjs");

const scrapeBildungsGesellschafts = async (req, res) => {
  try {
    const response = await axios.get(
      "https://www.fh-swf.de/de/studierende/studienorganisation/pruefungsplaene/soest/pruefungsplaene_4.php"
    );
    const $ = cheerio.load(response.data);

    const infoboxes = [];

    // Scrape Infoboxen für Anmelde- und Prüfungszeiträume
    $(".bubble-box__wrapper").each((i, element) => {
      const semester = $(element).find("p.headline--2").text().trim();
      const content = $(element).find("div").html().trim();

      if (semester && content) {
        infoboxes.push({ semester, content });
      }
    });

    const plans = [];

    // Scrape die Accordion-Elemente für verfügbare Prüfungspläne
    $(".accordion__wrapper .accordion__item").each((i, element) => {
      const semester = $(element).find(".accordion__head h3.headline--3").text().trim();
      const plansList = [];

      $(element)
        .find(".accordion__body .wysiwyg a")
        .each((j, link) => {
          const planName = $(link).text().trim();
          const planLink = $(link).attr("href");

          if (planName && planLink) {
            plansList.push({
              name: planName,
              link: `https://www.fh-swf.de${planLink}`,
            });
          }
        });

      if (semester && plansList.length > 0) {
        plans.push({ semester, plans: plansList });
      }
    });

    res.json({
      infoboxes,
      plans,
    });
  } catch (error) {
    handleError(
      res,
      `Fehler beim Scraping der Bildungs- und Gesellschaftswissenschaften-Prüfungsinformationen: ${error.message}`
    );
  }
};

module.exports = { scrapeBildungsGesellschafts };