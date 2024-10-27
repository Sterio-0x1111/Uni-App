const { fetchHTML, handleError } = require("../../../utils/helpers.cjs");

// Scrape-Funktion für Prüfungspläne des Fachbereichs Ingenieur- und Wirtschaftswissenschaften in Meschede
const scrapeIngenieurWirtschafts = async (req, res) => {
  try {
    const url =
      "https://www.fh-swf.de/de/studierende/studienorganisation/pruefungsplaene/meschede/index.php";
    const $ = await fetchHTML(url);

    const exams = [];

    // Selektiere die Tabelle mit Prüfungsinformationen
    $("#myTable0 tr").each((i, row) => {
      if (i === 0) return; // Überspringe die Kopfzeile

      const cell = $(row).find("td").first();
      const title = cell.find("b").first().text().trim(); // Prüfungstitel
      const examNumber = cell.find("a").first().text().trim(); // Prüfungsnummer
      const dozent = cell.html().match(/Dozent\*in:\s*(.*?)<br>/)?.[1] || "";
      const erstPruefer =
        cell.html().match(/Erstprüfer:\s*(.*?)<br>/)?.[1] || "";
      const zweitPruefer =
        cell.html().match(/Zweitprüfer(?: und Beisitzer)?:\s*(.*?)<br>/)?.[1] ||
        "";

      // Prüfungsform
      const pruefungsformMatch = cell
        .html()
        .match(/Prüfungsform:\s*<b>(.*?)<\/b>/);
      const pruefungsform = pruefungsformMatch
        ? pruefungsformMatch[1].trim()
        : "";

      // Prüfungsdatum
      const datumMatch = cell.html().match(/Datum:\s*<b>(.*?)<\/b>/);
      const datum = datumMatch ? datumMatch[1].trim() : "";

      exams.push({
        title,
        examNumber,
        dozent,
        erstPruefer,
        zweitPruefer,
        pruefungsform,
        datum,
      });
    });

    // Prüfen, ob Daten gefunden wurden
    if (exams.length === 0) {
      return res.status(404).json({ message: "Keine Prüfungsdaten gefunden." });
    }

    res.json(exams);
  } catch (error) {
    handleError(
      res,
      `Fehler beim Scraping der Prüfungspläne: ${error.message}`
    );
  }
};

module.exports = { scrapeIngenieurWirtschafts };