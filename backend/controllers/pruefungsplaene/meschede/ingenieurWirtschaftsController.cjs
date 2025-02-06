const { fetchHTML, handleError } = require("../../../utils/helpers.cjs");

const scrapeIngenieurWirtschafts = async (req, res) => {
  try {
    const url =
      "https://www.fh-swf.de/de/studierende/studienorganisation/pruefungsplaene/meschede/index.php";
    const $ = await fetchHTML(url);

    const exams = [];

    $("#myTable tr").each((i, row) => {
      if (i === 0) return; // Kopfzeile ignorieren

      const $td = $(row).find("td");
      if ($td.length === 0) return;

      const cellHtml = $td.html() || "";
      const cellText = $td.text().trim();
      if (!cellText) return;

      // Hilfsfunktion, um HTML-Tags zu entfernen
      const stripHtml = (str) => str.replace(/<[^>]+>/g, "").trim();

      // Aufteilen nach <br>-Zeilen
      const linesRaw = cellHtml
        .split(/<br\s*\/?>/i)
        .map((s) => s.trim())
        .filter(Boolean);

      // =======================
      // 1) Erste Zeile parsen: "DD.MM.YYYY HH:MM Uhr Raum: ... Dauer: K-XX(...)"
      // =======================
      const firstLine = stripHtml(linesRaw[0] || "");

      // Datum/Uhrzeit rausziehen (z. B. "20.01.2025 08:00 Uhr")
      const dateTimeMatch = firstLine.match(
        /(?<date>\d{2}\.\d{2}\.\d{4})\s+(?<time>\d{2}:\d{2})\s*Uhr/i
      );
      const date = dateTimeMatch?.groups?.date ?? "";
      const time = dateTimeMatch?.groups?.time
        ? dateTimeMatch.groups.time + " Uhr"
        : "";

      // Räume rausziehen (zwischen "Raum:" und "Dauer:")
      const roomMatch = firstLine.match(/Raum:\s*(.+?)\s+Dauer:/i);
      const rooms = roomMatch?.[1]?.trim() || "";

      // Prüfungsform = der "K-XX"-Teil
      const dauerMatch = firstLine.match(/Dauer:\s*(K-\d+)/i);
      const pruefungsform = dauerMatch?.[1] || "";

      // Zusätzliche Infos
      const parenMatches = firstLine.match(/\([^)]*\)/g) || [];
      const additionalInfosFromLine = parenMatches.map((p) =>
        p.replace(/^\(|\)$/g, "").trim()
      );

      // examSessions-Array
      const examSessions = [
        {
          date,
          time,
          rooms,
        },
      ];

      // =======================
      // 2) <b>-Block auslesen (enthält Prüfungsnummer(n) und Titel)
      // =======================
      const bHtml = $td.find("b").html() || "";
      // Beispiel: "21701 Automatisierung und IOT<br>17321 Automatisierungstechnik 1"
      const examLines = bHtml
        .split(/<br\s*\/?>/i)
        .map((s) => stripHtml(s))
        .filter(Boolean);

      // Jede Zeile sieht z. B. so aus: "21701 Automatisierung und IOT"
      const parsedExams = examLines.map((line) => {
        const match = line.match(/^(\d+)\s+(.*)$/);
        if (match) {
          return {
            examNumber: match[1].trim(),
            title: match[2].trim(),
          };
        }
        // Fallback, falls keine Nummer gefunden
        return {
          examNumber: "",
          title: line.trim(),
        };
      });

      // =======================
      // 3) Dozent & Mitarbeiter parsen
      // =======================
      const staffLines = linesRaw.slice(2).map(stripHtml);

      let dozent = "";
      const staffArray = [];

      staffLines.forEach((line) => {
        const dozentMatch = line.match(/^Dozent:\s*(.*)$/i);
        if (dozentMatch) {
          dozent = dozentMatch[1].trim();
          return;
        }
        // 1. Mitarbeiter: …
        const staffMatch = line.match(/^\d+\.\s+Mitarbeiter:\s*(.*)$/i);
        if (staffMatch) {
          staffArray.push(staffMatch[1].trim());
        }
      });

      // Für den alten Aufbau:
      // erstPruefer = staffArray[0] || ""
      // zweitPruefer = staffArray[1] || ""
      // Übrige Mitarbeiter ignorieren oder hängen sie an "additionalInfos" an
      const erstPruefer = staffArray[0] || "";
      const zweitPruefer = staffArray[1] || "";

      // Optional: restliche Mitarbeiter in additionalInfos
      const extraStaff = staffArray.slice(2);
      const allAdditionalInfos = additionalInfosFromLine.concat(extraStaff);

      // =======================
      // 4) Endgültige Objekte bauen
      // =======================
      parsedExams.forEach(({ examNumber, title }) => {
        exams.push({
          title,
          examNumber,
          dozent,
          erstPruefer,
          zweitPruefer,
          pruefungsform, // z. B. "K-90"
          zulassung: "",
          additionalInfos: allAdditionalInfos,
          examSessions, // [{ date, time, rooms }]
        });
      });
    });

    if (exams.length === 0) {
      return res.status(404).json({ message: "Keine Prüfungsdaten gefunden." });
    }

    return res.json(exams);
  } catch (error) {
    handleError(
      res,
      `Fehler beim Scraping der Prüfungspläne: ${error.message}`
    );
  }
};

module.exports = { scrapeIngenieurWirtschafts };

/* const { fetchHTML, handleError } = require("../../../utils/helpers.cjs");

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

module.exports = { scrapeIngenieurWirtschafts }; */
