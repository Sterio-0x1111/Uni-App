const { fetchHTML, handleError, checkLink } = require("../../../utils/helpers.cjs");
const { URL } = require('url');

/**
 * Wandelt eine relative URL in eine absolute URL um.
 * @param {string} relativeUrl - Die relative URL.
 * @param {string} baseUrl - Der Basis-URL.
 * @param {string} semester - Das aktuelle Semester.
 * @returns {string} - Die absolute URL.
 */
function makeAbsoluteUrl(relativeUrl, baseUrl, semester) {
    if (!relativeUrl) return relativeUrl;

    try {
        // Prüfe, ob die URL bereits absolut ist
        const url = new URL(relativeUrl);
        return url.href;
    } catch (e) {
        // Ist eine relative URL, kombiniere sie mit baseUrl und semester
        return `${baseUrl}${semester}/${relativeUrl}`;
    }
}

const scrapePruefungsData = async (req, res) => {
    const { semester, studiengangCode } = req.query;
    const baseUrl = "https://vpis.fh-swf.de/";
    const template = "2021";
    const viewType = "Pruefungen";
    const url = `${baseUrl}${semester}/studiengang.php3?&Studiengang=${studiengangCode}&ViewType=${viewType}&Template=${template}`;

    const isAccessible = await checkLink(url);
    if (!isAccessible) {
        return handleError(res, `Der Link ${url} ist nicht erreichbar.`);
    }

    try {
        const $ = await fetchHTML(url);

        // Verarbeitung der ersten Tabelle: Prüfungsteilzeiträume
        const teilzeitraeume = [];
        $('h4:contains("Prüfungsteilzeiträume")')
            .next("table")
            .find("tbody tr")
            .each((_, row) => {
                const dateRange = $(row).find("td").eq(0).text().trim();
                const fachbereich = $(row).find("td").eq(1).text().trim();
                teilzeitraeume.push({ dateRange, fachbereich });
            });

        // Verarbeitung der zweiten Tabelle: Fristen zur Anmeldung
        const anmeldungsfristen = [];
        $('h4:contains("Fristen zur Anmeldung")')
            .next("table")
            .find("tbody tr")
            .each((_, row) => {
                const zeitraum = $(row).find("td").eq(0).text().trim();
                const anmeldungen = [];
                $(row)
                    .find("td")
                    .eq(1)
                    .find("a")
                    .each((_, link) => {
                        anmeldungen.push({
                            name: $(link).text().trim(),
                            url: $(link).attr("href"),
                        });
                    });
                const infoUrlRelative = $(row).find("td").eq(2).find("a").attr("href");
                const infoUrl = makeAbsoluteUrl(infoUrlRelative, baseUrl, semester);
                anmeldungsfristen.push({ zeitraum, anmeldungen, infoUrl });
            });

        // Verarbeitung der dritten Tabelle: Prüfungstermine nach Prüfungsordnung
        const pruefungstermine = [];
        $('h4:contains("Prüfungstermine nach Prüfungsordnung")')
            .next("table")
            .find("tbody tr")
            .each((_, row) => {
                const abschluss = $(row).find("td").eq(0).text().trim();
                const version = $(row).find("td").eq(1).text().trim();
                const auslaufdatum = $(row).find("td").eq(2).text().trim();
                const studienverlaufsplanRelative = $(row).find("td").eq(3).find("a").attr("href");
                const kalenderansichtRelative = $(row).find("td").eq(4).find("a").attr("href");
                const internetKalenderRelative = $(row).find("td").eq(5).find("span").attr("href");

                // Konvertiere relative URLs in absolute URLs
                const studienverlaufsplan = makeAbsoluteUrl(studienverlaufsplanRelative, baseUrl, semester);
                const kalenderansicht = makeAbsoluteUrl(kalenderansichtRelative, baseUrl, semester);

                pruefungstermine.push({
                    abschluss,
                    version,
                    auslaufdatum,
                    studienverlaufsplan,
                    kalenderansicht,
                    internetKalenderRelative,
                });
            });

        res.json({ teilzeitraeume, anmeldungsfristen, pruefungstermine });
    } catch (error) {
        handleError(res, `Fehler beim Abrufen der Prüfungsdaten: ${error.message}`);
    }
};

module.exports = { scrapePruefungsData };