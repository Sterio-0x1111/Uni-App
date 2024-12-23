const { fetchHTML, handleError, checkLink } = require("../../../utils/helpers.cjs");

const scrapePruefungsData = async (req, res) => {
  const { semester, studiengangCode } = req.query;
  const baseUrl = "http://vpis.fh-swf.de/";
  const template = "2021";
  const viewType = "Pruefungen";
  const url = `${baseUrl}${semester}/studiengang.php3?&Studiengang=${studiengangCode}&ViewType=${viewType}&Template=${template}`;

  const isAccessible = await checkLink(url);
  if (!isAccessible) {
    return handleError(res, `Der Link ${url} ist nicht erreichbar.`);
  }

  try {
    const $ = await fetchHTML(url);

    // Prüfungsteilzeiträume (erste Tabelle)
    const teilzeitraeume = [];
    $('h4:contains("Prüfungsteilzeiträume")')
      .next("table")
      .find("tbody tr")
      .each((i, row) => {
        const dateRange = $(row).find("td").eq(0).text().trim();
        const fachbereich = $(row).find("td").eq(1).text().trim();
        teilzeitraeume.push({ dateRange, fachbereich });
      });

    // Fristen zur Anmeldung (zweite Tabelle)
    const anmeldungsfristen = [];
    $('h4:contains("Fristen zur Anmeldung")')
      .next("table")
      .find("tbody tr")
      .each((i, row) => {
        const zeitraum = $(row).find("td").eq(0).text().trim();
        const anmeldungen = [];
        $(row)
          .find("td")
          .eq(1)
          .find("a")
          .each((j, link) => {
            anmeldungen.push({
              name: $(link).text().trim(),
              url: $(link).attr("href"),
            });
          });
        const infoUrl = $(row).find("td").eq(2).find("a").attr("href");
        anmeldungsfristen.push({ zeitraum, anmeldungen, infoUrl });
      });

    // Prüfungstermine nach Prüfungsordnung (dritte Tabelle)
    const pruefungstermine = [];
    $('h4:contains("Prüfungstermine nach Prüfungsordnung")')
      .next("table")
      .find("tbody tr")
      .each((i, row) => {
        const abschluss = $(row).find("td").eq(0).text().trim();
        const version = $(row).find("td").eq(1).text().trim();
        const auslaufdatum = $(row).find("td").eq(2).text().trim();
        const studienverlaufsplan = $(row)
          .find("td")
          .eq(3)
          .find("a")
          .attr("href");
        const kalenderansicht = $(row).find("td").eq(4).find("a").attr("href");
        const internetKalender = $(row)
          .find("td")
          .eq(5)
          .find("span")
          .attr("href");

        pruefungstermine.push({
          abschluss,
          version,
          auslaufdatum,
          studienverlaufsplan,
          kalenderansicht,
          internetKalender,
        });
      });

    // Gebe die gesammelten Daten als JSON zurück
    res.json({ teilzeitraeume, anmeldungsfristen, pruefungstermine });
  } catch (error) {
    handleError(res, `Fehler beim Abrufen der Prüfungsdaten: ${error.message}`);
  }
};

module.exports = { scrapePruefungsData };