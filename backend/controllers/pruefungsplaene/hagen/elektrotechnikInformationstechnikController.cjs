const { fetchHTML, handleError } = require("../../../utils/helpers.cjs");

// Scrape-Funktion für Hinweise und Prüfungsplanlinks des Fachbereichs Elektrotechnik und Informationstechnik in Hagen
const scrapeElektrotechnikInformationstechnik = async (req, res) => {
  try {
    const url =
      "https://www.fh-swf.de/de/studierende/studienorganisation/pruefungsplaene/hagen_1/index~1.php";
    const $ = await fetchHTML(url);

    const content = [];

    // Selektiere das Artikel-Element mit Hinweisen und Fristen
    $("article.wysiwyg")
      .children()
      .each((_, element) => {
        const tag = $(element).prop("tagName").toLowerCase();

        if (tag === "h3" || tag === "p") {
          // Überschrift oder Absatztext hinzufügen
          const text = $(element).text().trim();
          content.push({ type: tag, text });
        } else if (tag === "ul") {
          // Listenelemente extrahieren
          const items = [];
          $(element)
            .find("li")
            .each((_, li) => {
              items.push($(li).text().trim());
            });
          content.push({ type: "list", items });
        } else if (tag === "a") {
          // Links extrahieren
          const linkText = $(element).text().trim();
          const href = $(element).attr("href");
          content.push({ type: "link", text: linkText, href });
        }
      });

    // Falls keine Daten gefunden wurden, gib eine Nachricht zurück
    if (content.length === 0) {
      return res.status(404).json({ message: "Keine Inhalte gefunden." });
    }

    res.json(content);
  } catch (error) {
    handleError(res, `Fehler beim Scraping der Inhalte: ${error.message}`);
  }
};

module.exports = { scrapeElektrotechnikInformationstechnik };