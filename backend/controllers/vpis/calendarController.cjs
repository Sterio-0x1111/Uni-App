const VPISPortalService = require("../../services/VPISPortalService.cjs");
const { fetchHTML } = require("../../utils/helpers.cjs");

/**
 * Liest das komplette Kalender-HTML, extrahiert den Header,
 * die Wochenlinks, die Tabellenstruktur und zusätzlich die Termine
 * (z. B. den Stundenplan) für die aktuell gewählte Kalenderwoche.
 *
 * Die gewünschte Woche kann optional als Query-Parameter "week" übergeben werden.
 * Andernfalls wird die aktuelle Woche (aus dem Header) verwendet.
 */
const scrapeMyCalendar = async (req, res) => {
  const vpisService = VPISPortalService.verifySession(req, res);
  if (!vpisService) return;
  
  try {
    const client = vpisService.createAxiosClient();
    const calendarDataURL = `https://vpis.fh-swf.de/${vpisService.semester}/student.php3/${vpisService.token}/view_meinplan`;
    const $ = await fetchHTML(calendarDataURL, client);

    // Extrahiert Kalenderüberschrift und alle KW-Links
    const calendarData = await scrapeCalendarData($);

    // Extrahiert die komplette Tabellenstruktur (z. B. für den Kalenderbereich)
    const tableStructure = scrapeTableStructure($);

    // Bestimmt die gewünschte Woche: per Query-Parameter "week" oder Standard: aktuelle Woche
    const week = req.query.week || calendarData.currentWeek;

    // Lädt die Termine-Seite (z. B. Stundenplan mit Veranstaltungen) für die gewählte Woche
    const termineData = await scrapeTermineForWeek(week, vpisService, client);

    res.status(200).json({
      data: { calendarData, tableStructure, termineData }
    });
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Laden: ", error: error.message });
  }
};

/**
 * Extrahiert aus dem HTML den Header (z. B. "Wochenplan 2025W06") und alle
 * in der Tabelle gefundenen KW-Links.
 */
const scrapeCalendarData = async ($) => {
  const headlineText = $("h2.headline--3.pb--24.lg-pb--64").text().trim();
  const headlineMatch = headlineText.match(/Wochenplan\s+([0-9]{4}W[0-9]{2})/);
  const currentWeek = headlineMatch ? headlineMatch[1] : null;

  const weeks = [];
  // Selektiert alle <a>-Tags innerhalb der Tabelle (Klasse "vpis-table12"), die einen "KW="-Parameter haben
  $("table.vpis-table12 a").each((i, el) => {
    const href = $(el).attr("href");
    if (href && href.includes("KW=")) {
      const queryString = href.split("?")[1];
      const params = new URLSearchParams(queryString);
      const kwParam = params.get("KW");
      if (kwParam && !weeks.includes(kwParam)) {
        weeks.push(kwParam);
      }
    }
  });

  return {
    headline: headlineText,
    currentWeek,
    availableWeeks: weeks,
  };
};

/**
 * Extrahiert die komplette Tabellenstruktur der Tabelle mit der Klasse "vpis-table12".
 * Dabei werden alle Zeilen (<tr>) und Zellen (<td> bzw. <th>) inklusive ihrer Attribute
 * und enthaltenen Links ausgelesen.
 */
const scrapeTableStructure = ($) => {
  const tableStructure = [];

  $("table.vpis-table12 tr").each((rowIndex, row) => {
    const rowData = [];
    $(row)
      .children("th, td")
      .each((cellIndex, cell) => {
        const $cell = $(cell);
        let cellText = $cell.text().trim();

        const $b = $cell.find("a");
        if (!cellText && $b.length === 0) cellText = "<->";

        const cellData = {
          tag: $cell[0].tagName.toLowerCase(),
          text: cellText,
          colspan: parseInt($cell.attr("colspan"), 10) || 1,
          title: $cell.attr("title") || null,
          class: $cell.attr("class") || null,
        };

        const $a = $cell.find("a");
        if ($a.length > 0) {
          // Holt den Title des Links
          const linkTitle = $a.attr("title") || "";
          const linkHref = $a.attr("href");

          // Prüft, ob im title (oder auch in der URL) das Stichwort "teilnehmer" vorkommt.
          if (!linkTitle.toLowerCase().includes("teilnehmer")) {
            cellData.link = {
              href: "https://vpis.fh-swf.de" + linkHref,
              text: $a.text().trim(),
              title: linkTitle || null,
            };
          }
          // Falls "teilnehmer" im Title vorkommt, wird kein Link hinzugefügt
        }
        rowData.push(cellData);
      });
    
    if (rowData[0] && rowData[0].text === "Std." || rowData.length >= 2 && rowData[1].text.includes("Studiengang hinzufügen")) {
      return;
    }
    
    tableStructure.push(rowData);
  });
  return tableStructure;
};

/**
 * Extrahiert aus dem HTML die Termine-Tabelle (z. B. den Stundenplan mit Veranstaltungen)
 * und ordnet die Termine anhand der Tabellenstruktur den Wochentagen zu.
 *
 * Hier wird ein Matrix-Ansatz verwendet, um mit row- und colspan umzugehen.
 */
const scrapeTermineWithDays = ($) => {
  // Findet die Tabelle, deren erste <th> den Text "Std." enthält.
  const $table = $('table').filter((i, el) => {
    return $(el).find('th').first().text().trim() === 'Std.';
  }).first();

  if (!$table.length) {
    return null;
  }

  // Extrahiert die Header-Zeile (z. B. ["Std.", "Montag,20.01.2025", ...])
  const headerCells = $table.find('tr').first().find('th');
  const days = [];
  headerCells.each((i, cell) => {
    if (i === 0) return; // erste Spalte "Std." überspringen
    days.push($(cell).text().trim());
  });

  const totalCols = headerCells.length;
  const grid = [];
  const spanningCells = {};

  // Holt alle Zeilen außer der Header-Zeile.
  const $rows = $table.find('tr').slice(1);
  $rows.each((rowIndex, row) => {
    // Erstellt eine Zeile mit totalCols-Spalten (anfangs alle auf null)
    grid[rowIndex] = new Array(totalCols).fill(null);
    let cellIndex = 0;

    // Falls für die aktuelle Zeile schon Zellen aus vorherigen rowspans vorhanden sind:
    if (spanningCells[rowIndex]) {
      Object.keys(spanningCells[rowIndex]).forEach(col => {
        grid[rowIndex][col] = spanningCells[rowIndex][col].cell;
      });
    }

    // Geht durch alle neuen Zellen (td, th) der aktuellen Zeile.
    $(row).children('td, th').each((i, cell) => {
      // Findet den nächsten freien Spaltenindex in der Zeile.
      while (cellIndex < totalCols && grid[rowIndex][cellIndex] !== null) {
        cellIndex++;
      }
      if (cellIndex >= totalCols) return; // Keine freie Spalte mehr

      const $cell = $(cell);
      const colspan = parseInt($cell.attr("colspan"), 10) || 1;
      const rowspan = parseInt($cell.attr("rowspan"), 10) || 1;
      // Speichert zusätzlich, in welcher Zeile die Zelle ursprünglich eingefügt wurde
      const cellData = {
        tag: $cell[0].tagName.toLowerCase(),
        text: $cell.text().trim(),
        colspan,
        rowspan,
        originRow: rowIndex
      };

      const $link = $cell.find("a");
      if ($link.length > 0) {
        // Holt den href und den text
        const linkHref = "https://vpis.fh-swf.de" + $link.attr("href");

        let linkText = $link.text().trim();

        // Wenn im href "Uebersicht" vorkommt, setze den Text auf "Uebersicht"
        if (linkHref && linkHref.includes("Uebersicht")) {
          linkText = "Übersicht";
        }

        cellData.link = {
          href: linkHref,
          text: linkText,
          title: $link.attr("title") || null,
        };
      }

      // Füllt in der aktuellen Zeile die Spalten von cellIndex bis cellIndex+colspan-1
      for (let j = 0; j < colspan; j++) {
        grid[rowIndex][cellIndex + j] = cellData;
        // Falls rowspan > 1
        if (rowspan > 1) {
          for (let r = rowIndex + 1; r < rowIndex + rowspan; r++) {
            spanningCells[r] = spanningCells[r] || {};
            spanningCells[r][cellIndex + j] = { cell: cellData };
          }
        }
      }
      cellIndex += colspan;
    });
  });

  // Extrahiert die Ereignisse aus der Matrix.
  // Dabei wird nur der Termin in der Ursprungszeile (originRow) übernommen, um Duplikate zu vermeiden.
  const events = [];
  grid.forEach((row, rIndex) => {
    const time = row[0] ? row[0].text : null;
    row.forEach((cell, colIndex) => {
      if (colIndex === 0) return;
      if (cell && cell.text && cell.text.trim() !== '' && cell.text.trim() !== '\u00a0') {
        // Fügt den Termin nur hinzu, wenn wir in der Zeile sind, in der die Zelle ursprünglich eingefügt wurde.
        if (cell.originRow === rIndex) {
          events.push({
            time,
            day: days[colIndex - 1] || null,
            details: cell
          });
        }
      }
    });
  });

  return {
    headers: headerCells.map((i, th) => $(th).text().trim()).get(),
    events,
  };
};

/**
 * Baut die URL für die gewünschte Kalenderwoche dynamisch zusammen, lädt das entsprechende HTML
 * und extrahiert anschließend mittels der Funktion scrapeTermineWithDays die Termine-Tabelle.
 *
 * @param {string} week - Kalenderwoche (z. B. "2025W04")
 * @param {object} reqSession - Session-Objekt mit den Feldern vpisSemester, vpisToken, vpisCookies
 */
const scrapeTermineForWeek = async (week, vpisService, client) => {
  const termineURL = `https://vpis.fh-swf.de/${vpisService.semester}/student.php3/${vpisService.token}/view_meinplan?ViewType=Plan&Template=2021&KW=${week}`;
  const $ = await fetchHTML(termineURL, client);

  const termine = scrapeTermineWithDays($);
  return {
    week,
    url: termineURL,
    termine,
  };
};

module.exports = { scrapeMyCalendar };