const { fetchHTML, handleError } = require("../../../utils/helpers.cjs");

const scrapeIngenieurWirtschafts = async (req, res) => {
  try {
    const url =
      "https://www.fh-swf.de/de/studierende/studienorganisation/pruefungsplaene/meschede/index.php";
    const $ = await fetchHTML(url);

    const exams = [];

    $("#myTable0 tr").each((i, row) => {
      if (i === 0) return; // Kopfzeile überspringen

      const cell = $(row).find("td").first();
      const html = cell.html(); // Den gesamten HTML-String für weitere Suchen verwenden

      // Basisinformationen
      const title = cell.find("b").first().text().trim();
      const examNumber = cell.find("a").first().text().trim();

      // Suche nach Dozent/in und Prüfern anhand einfacher Regex
      const dozent = (html.match(/Dozent\*in:\s*([^<]+)<br>/)?.[1] || "").trim().replace(/&amp;/g, "&");

      const erstPrueferMatch = html.match(/Erstprüfer:\s*([^<]+)<br>/);
      const erstPruefer = erstPrueferMatch ? erstPrueferMatch[1].trim() : "";

      const zweitPrueferMatch = html.match(/Zweitprüfer(?:\s*(?:und Beisitzer)?)?:\s*([^<]+)<br>/);
      const zweitPruefer = zweitPrueferMatch ? zweitPrueferMatch[1].trim() : "";

      const pruefungsformMatch = html.match(/Prüfungsform:\s*<b>(.*?)<\/b>/);
      const pruefungsform = pruefungsformMatch ? pruefungsformMatch[1].trim() : "";

      // Zulassungsinfo extrahieren (z. B. falls vorhanden: "Zulassung nur mit Prüfungsvorleistung Nr.: …")
      const zulassungMatch = html.match(/<sup[^>]*>[\s\S]*?Zulassung\s+nur\s+mit\s+Prüfungsvorleistung\s+Nr\.?:\s*([^<]+)<\/sup>/i);
      const zulassung = zulassungMatch ? zulassungMatch[1].trim() : "";

      // Zusätzliche <sup>-Infos sammeln, beispielsweise zur Prüfungsdurchführung etc.
      const additionalInfos = [];
      cell.find("sup").each((j, sup) => {
        const text = $(sup).text().trim();
        // Ignoriere Zulassungsinfos, die haben wir ggf. schon extrahiert
        if (
          text.includes("Zulassung nur") ||
          text.includes("Zul. Hilfsmittel")
        ) {
          additionalInfos.push(text);
        }
      });

      // Mehrere Datum-/Raum-Sitzungen extrahieren:
      // Wir suchen alle Vorkommnisse des Musters "Datum: <b>TT.MM.JJJJ</b> &nbsp; Zeit<br>"
      // und gehen davon aus, dass direkt im Anschluss "Raum/Räume: ..." folgen.
      const examSessions = [];
      const datumRegex = /Datum:\s*<b>(\d{2}\.\d{2}\.\d{4})<\/b>\s*&nbsp;\s*([^<]+)<br>/g;
      let datumMatch;
      // Alle Datumseinträge in einem Durchlauf sammeln
      while ((datumMatch = datumRegex.exec(html)) !== null) {
        examSessions.push({
          date: datumMatch[1].trim(),
          time: datumMatch[2].trim(),
          rooms: "", // Räume setzen wir gleich danach
        });
      }
      // Räume passend zu den Datumseinträgen extrahieren
      const roomsRegex = /Raum\/Räume:\s*([^<]+)<br>/g;
      let roomMatch;
      const roomsArr = [];
      while ((roomMatch = roomsRegex.exec(html)) !== null) {
        roomsArr.push(roomMatch[1].trim());
      }
      // Ordne die Räume den Sitzungen zu (Annahme: Reihenfolge entspricht der)
      examSessions.forEach((session, idx) => {
        session.rooms = roomsArr[idx] || "";
      });

      // Falls kein Datum gefunden wurde, als Fallback versuchen, einen einfachen Datumseintrag zu extrahieren
      // (unter Umständen mit störendem HTML, das wir hier bereinigen)
      if (examSessions.length === 0) {
        const simpleDateMatch = html.match(/Datum:\s*<b>([\d.]+)<\/b>/);
        const simpleDatum = simpleDateMatch ? simpleDateMatch[1].trim() : "";
        if (simpleDatum) {
          examSessions.push({ date: simpleDatum, time: "", rooms: "" });
        }
      }

      // Zusammenstellung des Objekts
      exams.push({
        title,
        examNumber,
        dozent,
        erstPruefer,
        zweitPruefer,
        pruefungsform,
        zulassung,        // Zulassungshinweis (falls vorhanden)
        additionalInfos,  // Array mit zusätzlichen Informationen aus <sup> (z.B. Zul. Hilfsmittel, Planung, etc.)
        examSessions,     // Array mit Datum-/Zeit- und Raum-/Räume‑Informationen (falls mehrfach vorhanden)
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