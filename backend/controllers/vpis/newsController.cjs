const { createAxiosClient, fetchHTML } = require("../../utils/helpers.cjs");
const { verifySession } = require("./vpisHelpers.cjs");

const scrapeMyNews = async (req, res) => {
  if (!verifySession(req, res)) return;
  const newsDataURL = `https://vpis.fh-swf.de/${req.session.vpisSemester}/student.php3/${req.session.vpisToken}/showmsglist?Template=2021`;

  try {
    const client = createAxiosClient(req.session.vpisCookies);
    const $ = await fetchHTML(newsDataURL, client);

    const messages = [];

    // Alle Nachrichten aus der Tabelle extrahieren
    $("table.vpis-table12 tbody tr").each((index, element) => {
      const row = $(element);
      
      // Besser mit msgID
      const msgLink = row.find('td:nth-child(2) a').attr("href") || "";
      const msgID = msgLink.match(/msg=(\d+)/)?.[1] || null;
      
      const dateTime = row.find("td:nth-child(2) span").text().trim();
      const sender = row.find("td:nth-child(3) a").text().trim();
      const subject = row.find("td:nth-child(4) a").text().trim();
      const size = row.find("td:nth-child(5)").text().trim();
      let preview = row.find("td:nth-child(6)").text().trim();
      preview = preview.replace(/\n/g, " ").replace(/\s+/g, " ");
      
      // Überprüfung, ob die Nachricht gelesen oder ungelesen ist
      const isUnread = row.hasClass("fhorange") || row.find("span[title='ungelesen']").length > 0;

      messages.push({ msgID, dateTime, sender, subject, size, preview, isUnread });
    });

    res.json({ messages });

  } catch (error) {
    res.status(500).json({ message: "Fehler beim Laden der Nachrichten", error: error.message });
  }
};

const scrapeMyMessage = async (req, res) => {
  if (!verifySession(req, res)) return;
  const messageURL = `https://vpis.fh-swf.de/${req.session.vpisSemester}/student.php3/${req.session.vpisToken}/msgread?msg=${req.params.msgID}&Template=2021`;

  try {
    const client = createAxiosClient(req.session.vpisCookies);
    const $ = await fetchHTML(messageURL, client);

    // Betreff extrahieren
    const subject = $("article.wysiwyg h3").eq(1).text().trim();

    // Datum und Absender extrahieren
    const dateTimeSenderText = $("article.wysiwyg div").eq(1).text().trim();
    const dateTimeMatch = dateTimeSenderText.match(/(.+?) von (.+)/);
    const dateTime = dateTimeMatch ? dateTimeMatch[1].trim() : null;
    const sender = dateTimeMatch ? dateTimeMatch[2].trim() : null;

    // Fachbereich, Modul, Veranstaltung (falls vorhanden)
    const fachbereich = $("article.wysiwyg span:contains('Fachbereich:')").next("b").text().trim() || null;
    const modul = $("article.wysiwyg span:contains('Modul:')").next("b").text().trim() || null;
    const veranstaltung = $("article.wysiwyg span:contains('Veranstaltung:')").next("b").text().trim() || null;

    $("article.wysiwyg")
      .contents()
      .filter(function () {
        // Sicherstellen, dass es sich um einen Kommentar handelt und dass data existiert
        if (this.type !== "comment" || !this.data) {
          return false;
        }
        const trimmedData = this.data.trim();
        return trimmedData.startsWith("Template") || trimmedData.startsWith("/Template");
      })
      .remove();
    $("article.wysiwyg h3").remove();              // beide Überschriften
    $("article.wysiwyg div").eq(0).remove();       // Buttons
    $("article.wysiwyg div").eq(0).remove();       // nach dem Entfernen von eq(0) ist das nächste div nun eq(0) (Datum/Absender)
    $("article.wysiwyg div").eq(0).remove();       // Info-Div (Fachbereich, Modul, Veranstaltung)

    const messageContent = $("article.wysiwyg").html()?.trim() || "";

    res.json({
      subject,
      dateTime,
      sender,
      fachbereich,
      modul,
      veranstaltung,
      messageContent,
    });

  } catch (error) {
    res.status(500).json({ message: "Fehler beim Laden der Nachricht", error: error.message });
  }
};

module.exports = { scrapeMyNews, scrapeMyMessage };