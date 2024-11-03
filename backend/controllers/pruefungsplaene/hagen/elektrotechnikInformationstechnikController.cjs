const { fetchHTML, handleError } = require("../../../utils/helpers.cjs");

// Funktion zum Scrapen der Hinweise und Prüfungsplanlinks für Elektrotechnik und Informationstechnik in Hagen
const scrapeElektrotechnikInformationstechnik = async (req, res) => {
  try {
    const url = "https://www.fh-swf.de/de/studierende/studienorganisation/pruefungsplaene/hagen_1/index~1.php";
    const $ = await fetchHTML(url);

    const content = [];

    // Artikel-Element durchlaufen und Inhalte extrahieren
    $("article.wysiwyg")
      .children()
      .each((_, element) => {
        const tag = $(element).prop("tagName").toLowerCase();

        if (tag === "h3" || tag === "p") {
          // Überschrift oder Absatz
          const text = $(element).text().trim();
          content.push({ type: tag, text });
        } else if (tag === "ul") {
          // Listenelemente
          const items = [];
          $(element)
            .find("li")
            .each((_, li) => {
              items.push($(li).text().trim());
            });
          content.push({ type: "list", items });
        } else if (tag === "a") {
          // Link
          const linkText = $(element).text().trim();
          const href = $(element).attr("href");
          content.push({ type: "link", text: linkText, href });
        }
      });

    if (content.length === 0) {
      return res.status(404).json({ message: "Keine Inhalte gefunden." });
    }

    res.json(content);
  } catch (error) {
    handleError(res, `Fehler beim Scraping der Inhalte: ${error.message}`);
  }
};

module.exports = { scrapeElektrotechnikInformationstechnik };