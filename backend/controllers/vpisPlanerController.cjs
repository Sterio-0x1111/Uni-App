const { fetchHTML, handleError } = require("../utils/helpers.cjs");

// Scrape-Funktion für Veranstaltungsplanende
const scrapePlaner = async (req, res) => {
  try {
    const url = "https://vpis.fh-swf.de/index.php/de/vpis/vpis_planer.php";
    const $ = await fetchHTML(url);

    const events = [];

    // Selektiere alle accordion__item-Divs
    $(".accordion__item").each((i, element) => {
      const title = $(element).find(".headline--3").text().trim(); // Fachbereichsname
      const location = $(element).find("p.mt--8").text().trim(); // Standorte
      const contacts = [];

      // Sammle die Kontaktinformationen
      $(element)
        .find(".list-wrapper__item")
        .each((i, contactElement) => {
          const contactName = $(contactElement)
            .find("a.link__text")
            .text()
            .trim();
          const contactLink = $(contactElement).find("a").attr("href");

          contacts.push({
            name: contactName,
            link: contactLink,
          });
        });

      // Füge die gesammelten Daten hinzu
      events.push({
        title,
        location,
        contacts,
      });
    });

    // Prüfen, ob Daten gefunden wurden
    if (events.length === 0) {
      return res
        .status(404)
        .json({ message: "Keine Veranstaltungsdaten gefunden." });
    }

    res.json(events); // Rückgabe der Daten als JSON
  } catch (error) {
    handleError(
      res,
      `Fehler beim Scraping der Veranstaltungsplanenden: ${error.message}`
    );
  }
};

module.exports = { scrapePlaner };