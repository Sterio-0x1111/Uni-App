const { fetchHTML, handleError } = require("../../../utils/helpers.cjs");

// Funktion zum Scrapen der Prüfungspläne für Ingenieur- und Wirtschaftswissenschaften in Meschede
const scrapeIngenieurWirtschafts = async (req, res) => {
  try {
    const url = "https://www.fh-swf.de/de/studierende/studienorganisation/pruefungsplaene/meschede/index.php";
    const $ = await fetchHTML(url);

    const exams = [];

    // Tabelle mit Prüfungsinformationen durchlaufen und Daten extrahieren
    $("#myTable0 tr").each((i, row) => {
      if (i === 0) return; // Kopfzeile überspringen

      const cell = $(row).find("td").first();
      const title = cell.find("b").first().text().trim();
      const examNumber = cell.find("a").first().text().trim();
      const dozent = cell.html().match(/Dozent\*in:\s*(.*?)<br>/)?.[1] || "";
      const erstPruefer = cell.html().match(/Erstprüfer:\s*(.*?)<br>/)?.[1] || "";
      const zweitPruefer = cell.html().match(/Zweitprüfer(?: und Beisitzer)?:\s*(.*?)<br>/)?.[1] || "";

      const pruefungsformMatch = cell.html().match(/Prüfungsform:\s*<b>(.*?)<\/b>/);
      const pruefungsform = pruefungsformMatch ? pruefungsformMatch[1].trim() : "";

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

    if (exams.length === 0) {
      return res.status(404).json({ message: "Keine Prüfungsdaten gefunden." });
    }

    res.json(exams);
  } catch (error) {
    handleError(res, `Fehler beim Scraping der Prüfungspläne: ${error.message}`);
  }
};

module.exports = { scrapeIngenieurWirtschafts };