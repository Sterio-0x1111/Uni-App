const { handleError, fetchHTML } = require("../../../utils/helpers.cjs");

// Funktion zum Scrapen aller Seiten der Prüfungsinformationen
const scrapeTechnischeBetriebswirtschaft = async (req, res) => {
  try {
    const params = new URLSearchParams();
    
    // Schleife durch die Query-Objekteigenschaften
    Object.keys(req.query).forEach((key) => {
      if (key !== "url") {
        params.append(key, req.query[key]);
      }
    });

    const url = `${req.query.url}&${params.toString()}`; // Dynamische URL erstellen
    if (!url) {
      return res.status(400).json({ error: "Es muss eine gültige URL angegeben werden." });
    }
    
    let currentPage = 1;
    let hasMorePages = true;
    const exams = [];

    while (hasMorePages) {
      // Füge die aktuelle Seite zur URL hinzu
      const paginatedUrl = `${url}&page=${currentPage}`;
      const $ = await fetchHTML(paginatedUrl);

      // Scrape die Prüfungsdaten von der aktuellen Seite
      $(".table.table-striped tbody tr").each((i, row) => {
        const pos = $(row).find("td").eq(0).text().trim();
        const modul = $(row).find("td").eq(1).text().trim();
        const pruefer = $(row).find("td").eq(2).text().trim();
        const pruefungsart = $(row).find("td").eq(3).text().trim();
        const termin = $(row).find("td").eq(4).text().trim().replace(/<br\s*\/?>/g, " ");
        const raeume = $(row).find("td").eq(5).text().trim();
        const studierende = $(row).find("td").eq(6).text().trim();

        exams.push({pos, modul, pruefer, pruefungsart, termin, raeume, studierende});
      });

      // Überprüfe, ob es eine weitere Seite gibt
      const paginationLinks = $(".pagination .page-item a.page-link");
      hasMorePages = false;

      paginationLinks.each((i, link) => {
        const linkPageNumber = $(link).text().trim();
        if (parseInt(linkPageNumber) === currentPage + 1) {
          hasMorePages = true;
        }
      });

      // Gehe zur nächsten Seite
      currentPage++;
    }

    // Falls keine Daten gefunden wurden, eine Fehlermeldung zurückgeben
    if (exams.length === 0) {
      return res.status(404).json({ message: "Keine Prüfungsdaten gefunden." });
    }

    res.json(exams); // Rückgabe der strukturierten Prüfungsdaten
  } catch (error) {
    handleError(res, `Fehler beim Scraping der Prüfungsinformationen: ${error.message}`);
  }
};

module.exports = { scrapeTechnischeBetriebswirtschaft };