require("dotenv").config();
const axios = require("axios");
const cheerio = require("cheerio");
const { wrapper } = require("axios-cookiejar-support");
const { CookieJar } = require("tough-cookie");

// Funktion, die die gewünschte Seite (PayReport) abruft
const scrapePayments = async (req, res) => {
  // Prüfen, ob der Benutzer eingeloggt ist und die nötigen Session-Daten vorliegen
  if (!req.session.loggedInHSP || !req.session.hspCookies) {
    return res
      .status(401)
      .json({ message: "Nicht eingeloggt. Bitte zuerst anmelden." });
  }

  // URL der Seite, die abgerufen werden soll
  const payReportURL =
    "https://hochschulportal.fh-swf.de/qisserver/pages/cm/exa/enrollment/info/start.xhtml?_flowId=studyservice-flow&_flowExecutionKey=e1s1";

  try {
    const jar = CookieJar.deserializeSync(req.session.hspCookies);
    // Axios-Client mit Session-Cookies erstellen
    const client = wrapper(
      axios.create({
        jar: jar, // Die in der Session gespeicherte CookieJar-Instanz
        withCredentials: true,
      })
    );

    // GET-Anfrage an die Ziel-URL senden
    const response = await client.get(payReportURL, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    const $ = cheerio.load(response.data);

    // Zieldaten extrahieren
    const rows = $(
      "#studyserviceForm\\:stgStudent\\:collapsibleFieldsetCourseOfStudies\\:fieldsetDegreeProgram_1\\:degreeProgramProgresTable\\:degreeProgramProgresTableTable tbody tr"
    );

    const extractedData = [];

    rows.each((index, row) => {
      const columns = $(row).find("td");
      const subject = $(columns[0]).find("span:last-child").text().trim();
      const semester = $(columns[1]).find("span:last-child").text().trim();
      const indicator = $(columns[2]).find("span:last-child").text().trim();
      const examVersion = $(columns[3]).find("span:last-child").text().trim();

      extractedData.push({
        Fach: subject,
        Fachsemester: semester,
        Fachkennzeichen: indicator,
        Prüfungsordnungsversion: examVersion,
      });
    });

    res.status(200).json(extractedData);
  } catch (error) {
    console.error("Fehler beim Abrufen des PayReports:", error);
    res.status(500).json({
      message: "Fehler beim Laden des PayReports",
      error: error.message,
    });
  }
};

const extractFlowExecutionKey = (html) => {
  const match = html.match(/_flowExecutionKey=([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
};

const payReport = async (req, res) => {
  if (!req.session.loggedInHSP || !req.session.hspCookies) {
    return res
      .status(401)
      .json({ message: "Nicht eingeloggt. Bitte zuerst anmelden." });
  }

  try {
    const jar = CookieJar.deserializeSync(req.session.hspCookies);
    const client = wrapper(
      axios.create({
        jar,
        withCredentials: true,
      })
    );

    // Initialen GET-Request ausführen, um den _flowExecutionKey zu erhalten
    const initialResponse = await client.get(
      "https://hochschulportal.fh-swf.de/qisserver/pages/cm/exa/enrollment/info/start.xhtml?_flowId=studyservice-flow&_flowExecutionKey=e1s1"
    );
    const flowExecutionKey = extractFlowExecutionKey(initialResponse.data);

    if (!flowExecutionKey) {
      return res.status(500).json({ message: "FlowExecutionKey konnte nicht extrahiert werden." });
    }

    const url = `https://hochschulportal.fh-swf.de/qisserver/pages/cm/exa/enrollment/info/start.xhtml?_flowId=studyservice-flow&_flowExecutionKey=${flowExecutionKey}`;
    const response = await client.post(
      url, new URLSearchParams({
      "activePageElementId": "studyserviceForm:billsAndPayment_TabBtn",
      "refreshButtonClickedId": "",
      "navigationPosition": "hisinoneMeinStudium,hisinoneStudyservice",
      "authenticity_token": req.session.authenticity_token,
      "autoScroll": "0,0",
      "studyserviceForm:fieldsetPersonelicheData:collapsiblePanelCollapsedState": "value",
      "studyserviceForm:content.7": "",
      "studyserviceForm:billsAndPayment:fieldSetInvoice:collapsiblePanelCollapsedState": "",
      "studyserviceForm:billsAndPayment:fieldSetInvoiceOffen:collapsiblePanelCollapsedState": "",
      "studyserviceForm:billsAndPayment:fieldSetInvoicePaid:collapsiblePanelCollapsedState": "",
      "studyserviceForm_SUBMIT": "1",
      "javax.faces.ViewState": flowExecutionKey
    }).toString(),
    {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    console.log(response.url)

    const $ = cheerio.load(response.data);
    // console.log(response.data);

    // JSON-Objekt für die gesamte Seite
    const allData = {};

    // Abschnitt: Offene Zahlungen
    allData["offeneZahlungen"] = [];
    $(
      "#studyserviceForm\\:billsAndPayment\\:fieldSetInvoice\\:fieldSetInvoiceOffen tbody tr"
    ).each((_, row) => {
      const columns = $(row).find("td");
      allData["offeneZahlungen"].push({
        Zeitraum: $(columns[0]).text().trim(),
        Verwendungszweck: $(columns[1]).text().trim(),
        Soll: $(columns[2]).text().trim(),
        Ist: $(columns[3]).text().trim(),
      });
    });

    // Abschnitt: Geleistete Zahlungen
    allData["geleisteteZahlungen"] = [];
    $(
      "#studyserviceForm\\:billsAndPayment\\:fieldSetInvoice\\:fieldSetInvoicePaid tbody tr"
    ).each((_, row) => {
      const columns = $(row).find("td");
      allData["geleisteteZahlungen"].push({
        Zeitraum: $(columns[0]).text().trim(),
        Verwendungszweck: $(columns[1]).text().trim(),
        Soll: $(columns[2]).text().trim(),
        Ist: $(columns[3]).text().trim(),
      });
    });

    // Abschnitt: Hinweise und Details
    allData["details"] = $(
      "#studyserviceForm\\:billsAndPayment\\:fieldSetInvoice .box_content div"
    )
      .text()
      .trim();

    res.status(200).json(allData);
  } catch (error) {
    console.error("Fehler beim Scraping:", error);
    res
      .status(500)
      .json({ message: "Fehler beim Laden der Daten", error: error.message });
  }
};

module.exports = { payReport, scrapePayments };

// const serializedCookies = cookieJar.serializeSync();
// req.session.hspCookies = serializedCookies;
// req.session.save();

// const { CookieJar } = require("tough-cookie");
// const jar = CookieJar.deserializeSync(req.session.hspCookies);