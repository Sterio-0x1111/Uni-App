const { createAxiosClient, fetchHTML } = require("../../utils/helpers.cjs");
const { verifySession } = require("./vpisHelpers.cjs");

/**
 * Hauptfunktion: Liest das komplette Kalender-HTML, extrahiert den Header,
 * die Wochenlinks, die Tabellenstruktur und zusätzlich die Termine
 * (z. B. den Stundenplan) für die aktuell gewählte Kalenderwoche.
 *
 * Die gewünschte Woche kann optional als Query-Parameter "week" übergeben werden.
 * Andernfalls wird die aktuelle Woche (aus dem Header) verwendet.
 */
const scrapeMyCalendar = async (req, res) => {
  if (!verifySession(req, res)) return;

  // URL der Kalenderübersicht (Wochenplan)
  const calendarDataURL = `https://vpis.fh-swf.de/${req.session.vpisSemester}/student.php3/${req.session.vpisToken}/view_meinplan`;

  try {
    const client = createAxiosClient(req.session.vpisCookies);
    const $ = await fetchHTML(calendarDataURL, client);

    // Extrahiere Kalenderüberschrift und alle KW-Links
    const calendarData = await scrapeCalendarData($);

    // Extrahiere die komplette Tabellenstruktur (z. B. für den Kalenderbereich)
    const tableStructure = scrapeTableStructure($);

    // Bestimme die gewünschte Woche: per Query-Parameter "week" oder Standard: aktuelle Woche
    const week = req.query.week || calendarData.currentWeek;
    // Lade die Termine-Seite (z. B. Stundenplan mit Veranstaltungen) für die gewählte Woche
    const termineData = await scrapeTermineForWeek(week, req.session);

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
  // Annahme: Der h2-Tag besitzt die Klassen "headline--3 pb--24 lg-pb--64"
  const headlineText = $("h2.headline--3.pb--24.lg-pb--64").text().trim();
  // Mit Regex wird aus dem Header der KW-Code (z. B. "2025W06") extrahiert
  const headlineMatch = headlineText.match(/Wochenplan\s+([0-9]{4}W[0-9]{2})/);
  const currentWeek = headlineMatch ? headlineMatch[1] : null;

  const weeks = [];
  // Selektiere alle <a>-Tags innerhalb der Tabelle (Klasse "vpis-table12"), die einen "KW="-Parameter haben
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
        const cellData = {
          tag: $cell[0].tagName.toLowerCase(),
          text: $cell.text().trim(),
          colspan: parseInt($cell.attr("colspan"), 10) || 1,
          title: $cell.attr("title") || null,
          class: $cell.attr("class") || null,
        };

        const $a = $cell.find("a");
        if ($a.length > 0) {
          cellData.link = {
            href: $a.attr("href"),
            text: $a.text().trim(),
            title: $a.attr("title") || null,
          };
        }
        rowData.push(cellData);
      });
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
  // Finde die Tabelle, deren erste <th> den Text "Std." enthält.
  const $table = $('table').filter((i, el) => {
    return $(el).find('th').first().text().trim() === 'Std.';
  }).first();

  if (!$table.length) {
    return null;
  }

  // Extrahiere die Header-Zeile (z. B. ["Std.", "Montag,20.01.2025", ...])
  const headerCells = $table.find('tr').first().find('th');
  const days = [];
  headerCells.each((i, cell) => {
    if (i === 0) return; // erste Spalte "Std." überspringen
    days.push($(cell).text().trim());
  });

  // Gesamtzahl der Spalten (entspricht der Anzahl der Header-Zellen)
  const totalCols = headerCells.length;

  // Erstelle die Matrix (grid) mit fixer Spaltenanzahl
  const grid = [];
  // Objekt zum Speichern von Zellen, die über mehrere Zeilen hinweg gelten (rowspan)
  const spanningCells = {};

  // Hole alle Zeilen außer der Header-Zeile.
  const $rows = $table.find('tr').slice(1);
  $rows.each((rowIndex, row) => {
    // Erstelle eine Zeile mit totalCols-Spalten (anfangs alle auf null)
    grid[rowIndex] = new Array(totalCols).fill(null);
    let cellIndex = 0;

    // Falls für die aktuelle Zeile schon Zellen aus vorherigen rowspans vorhanden sind:
    if (spanningCells[rowIndex]) {
      Object.keys(spanningCells[rowIndex]).forEach(col => {
        grid[rowIndex][col] = spanningCells[rowIndex][col].cell;
      });
    }

    // Gehe durch alle neuen Zellen (td, th) der aktuellen Zeile.
    $(row).children('td, th').each((i, cell) => {
      // Finde den nächsten freien Spaltenindex in der Zeile.
      while (cellIndex < totalCols && grid[rowIndex][cellIndex] !== null) {
        cellIndex++;
      }
      if (cellIndex >= totalCols) return; // Keine freie Spalte mehr

      const $cell = $(cell);
      const colspan = parseInt($cell.attr("colspan"), 10) || 1;
      const rowspan = parseInt($cell.attr("rowspan"), 10) || 1;
      // Speichere zusätzlich, in welcher Zeile die Zelle ursprünglich eingefügt wurde
      const cellData = {
        tag: $cell[0].tagName.toLowerCase(),
        text: $cell.text().trim(),
        colspan,
        rowspan,
        originRow: rowIndex // Hier speichern wir den Ursprungszeilenindex
      };

      const $link = $cell.find("a");
      if ($link.length > 0) {
        cellData.link = {
          href: $link.attr("href"),
          text: $link.text().trim(),
          title: $link.attr("title") || null,
        };
      }

      // Fülle in der aktuellen Zeile die Spalten von cellIndex bis cellIndex+colspan-1
      for (let j = 0; j < colspan; j++) {
        grid[rowIndex][cellIndex + j] = cellData;
        // Falls rowspan > 1, trage diese Zelle für die folgenden Zeilen ein.
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

  // Extrahiere die Ereignisse aus der Matrix.
  // Dabei wird nur der Termin in der Ursprungszeile (originRow) übernommen, um Duplikate zu vermeiden.
  const events = [];
  grid.forEach((row, rIndex) => {
    const time = row[0] ? row[0].text : null;
    row.forEach((cell, colIndex) => {
      if (colIndex === 0) return; // Überspringe die Zeit-Spalte
      if (cell && cell.text && cell.text.trim() !== '' && cell.text.trim() !== '\u00a0') {
        // Füge den Termin nur hinzu, wenn wir in der Zeile sind, in der die Zelle ursprünglich eingefügt wurde.
        if (cell.originRow === rIndex) {
          events.push({
            time,
            // Da days[0] zur zweiten Spalte gehört, verwenden wir colIndex-1
            day: days[colIndex - 1] || null,
            details: cell
          });
        }
      }
    });
  });

  return {
    headers: headerCells.map((i, th) => $(th).text().trim()).get(),
    events, // Termine mit zugeordnetem Tag und Uhrzeit
  };
};

/**
 * Baut die URL für die gewünschte Kalenderwoche dynamisch zusammen, lädt das entsprechende HTML
 * und extrahiert anschließend mittels der Funktion scrapeTermineWithDays die Termine-Tabelle.
 *
 * @param {string} week - Kalenderwoche (z. B. "2025W04")
 * @param {object} reqSession - Session-Objekt mit den Feldern vpisSemester, vpisToken, vpisCookies
 */
const scrapeTermineForWeek = async (week, reqSession) => {
  const termineURL = `https://vpis.fh-swf.de/${reqSession.vpisSemester}/student.php3/${reqSession.vpisToken}/view_meinplan?ViewType=Plan&Template=2021&KW=${week}`;
  const client = createAxiosClient(reqSession.vpisCookies);
  const $ = await fetchHTML(termineURL, client);

  const termine = scrapeTermineWithDays($);
  return {
    week,
    url: termineURL,
    termine,
  };
};

module.exports = { scrapeMyCalendar };