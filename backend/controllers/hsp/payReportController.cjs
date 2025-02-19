const cheerio = require("cheerio");
const HSPPortalService = require("../../services/HSPPortalService.cjs");
const { extractFlowExecutionKey } = require("./hspHelpers.cjs");

/**
 * Funktion zum Scrapen der Zahlungen und Rückmeldungen.
 */
const scrapePayments = async (req, res) => {
  const hspService = HSPPortalService.verifySession(req, res);
  if (!HSPPortalService.verify(req, res)) return;

  const paymentsURL = "https://hochschulportal.fh-swf.de/qisserver/pages/cs/sys/portal/hisinoneStartPage.faces";

  // POST-Daten vorbereiten
  const postData = new URLSearchParams({
    activePageElementId: "startPage:panelTab_4_TabBtn",
    refreshButtonClickedId: "",
    navigationPosition: "",
    authenticity_token: req.session.authenticity_token,
    autoScroll: "0,0",
    "startPage:panelID.4:": "",
    "startPage:panelTab_4:portletInstanceId_59315:portletInstanceId_59315CollapsedState": "false",
    startPage_SUBMIT: "1",
    "javax.faces.ViewState": req.session.viewState,
  }).toString();

  try {
    const client = hspService.createAxiosClient();

    // POST-Anfrage an die Zahlungen-URL
    const response = await client.post(paymentsURL, postData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    const $ = cheerio.load(response.data);

    // Das spezifische <div> mit den Zahlungen auswählen
    const paymentsDiv = $(
      "#startPage\\:panelTab_4\\:portletInstanceId_59315\\:portletInstanceId_59315"
    );

    if (paymentsDiv.length === 0) {
      return res.status(200).json({ message: "Der gewünschte Abschnitt wurde nicht gefunden." }); // Test normal 404
    }

    // const extractedHTML = paymentsDiv.html();

    const extractedData = {
      title: paymentsDiv.find('h2.portletHeader').text().trim(),
      content: paymentsDiv.find('.textPortlet').text().trim(),
      iban: paymentsDiv.find('td').filter((i, el) => $(el).text().includes('IBAN')).next().text().trim(),
      bic: paymentsDiv.find('td').filter((i, el) => $(el).text().includes('BIC')).next().text().trim(),
      kreditinstitut: paymentsDiv.find('td').filter((i, el) => $(el).text().includes('Kreditinstitut')).next().text().trim(),
    };

    res.status(200).json({
      // html: extractedHTML, // Sende den gesamten HTML-Inhalt
      // bei strukturierte Daten:
      data: extractedData
    });
  } catch (error) {
    console.error("Fehler beim Abrufen der Zahlungen & Rückmeldungen:", error);
    res.status(500).json({
      message: "Fehler beim Laden der Zahlungen & Rückmeldungen",
      error: error.message,
    });
  }
};

/**
 * Funktion zum Scrapen von Zahlungen.
 */
const payReport = async (req, res) => {
  const hspService = HSPPortalService.verifySession(req, res);
  if (!HSPPortalService.verify(req, res)) return;

  try {
    const client = hspService.createAxiosClient();

    // Schritt 1: Initialer GET-Request, um den aktuellen FlowExecutionKey zu erhalten
    const initialGetUrl = "https://hochschulportal.fh-swf.de/qisserver/pages/cm/exa/enrollment/info/start.xhtml" +
      "?_flowId=studyservice-flow&navigationPosition=hisinoneMeinStudium%2ChisinoneStudyservice&recordRequest=true";
    const initialResponse = await client.get(initialGetUrl);

    // FlowExecutionKey extrahieren
    let flowExecutionKey = extractFlowExecutionKey(initialResponse.request.res.responseUrl);
    if (!flowExecutionKey) {
      return res.status(500).json({ message: "FlowExecutionKey konnte nicht ermittelt werden (initial GET)." });
    }

    // Schritt 2: POST-Request mit dem erhaltenen FlowExecutionKey
    const postUrl = `https://hochschulportal.fh-swf.de/qisserver/pages/cm/exa/enrollment/info/start.xhtml?_flowId=studyservice-flow&_flowExecutionKey=${flowExecutionKey}`;

    const postData = new URLSearchParams({
      "activePageElementId": "studyserviceForm:billsAndPayment_TabBtn",
      "refreshButtonClickedId": "",
      "navigationPosition": "hisinoneMeinStudium,hisinoneStudyservice",
      "authenticity_token": req.session.authenticity_token,
      "autoScroll": "0,0",
      "studyserviceForm:fieldsetPersoenlicheData:collapsiblePanelCollapsedState": "value",
      "studyserviceForm:content.7": "",
      "studyserviceForm:billsAndPayment:fieldSetInvoice:collapsiblePanelCollapsedState": "",
      "studyserviceForm:billsAndPayment:fieldSetInvoiceOffen:collapsiblePanelCollapsedState": "",
      "studyserviceForm:billsAndPayment:fieldSetInvoicePaid:collapsiblePanelCollapsedState": "",
      "studyserviceForm_SUBMIT": "1",
      "javax.faces.ViewState": flowExecutionKey
    }).toString();

    const postResponse = await client.post(postUrl, postData, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    // Finale URL nach dem POST-Redirect
    const postFinalUrl = postResponse.request.res.responseUrl;
    const newFlowExecutionKey = extractFlowExecutionKey(postFinalUrl);

    // Schritt 3: Finaler GET-Request zur finalen URL
    const finalResponse = await client.get(postFinalUrl, {
      params: {
        _flowId: "studyservice-flow",
        _flowExecutionKey: newFlowExecutionKey
      },
      headers: {
        "User-Agent": "Mozilla/5.0"
      },
    });

    const $ = cheerio.load(finalResponse.data);

    // Datenstruktur
    const allData = {
      offeneZahlungen: [],
      geleisteteZahlungen: [],
      details: $("#studyserviceForm\\:billsAndPayment\\:fieldSetInvoice .box_content div").text().trim()
    };

    // Offene Zahlungen extrahieren
    $("#studyserviceForm\\:billsAndPayment\\:fieldSetInvoice\\:fieldSetInvoiceOffen tbody tr").each((_, row) => {
      const columns = $(row).find("td");
      allData.offeneZahlungen.push({
        Zeitraum: $(columns[0]).text().trim(),
        Verwendungszweck: $(columns[1]).text().trim(),
        Soll: $(columns[2]).text().trim(),
        Ist: $(columns[3]).text().trim(),
      });
    });

    // Geleistete Zahlungen extrahieren
    $("#studyserviceForm\\:billsAndPayment\\:fieldSetInvoice\\:fieldSetInvoicePaid tbody tr").each((_, row) => {
      const columns = $(row).find("td");
      allData.geleisteteZahlungen.push({
        Zeitraum: $(columns[0]).text().trim(),
        Verwendungszweck: $(columns[1]).text().trim(),
        Soll: $(columns[2]).text().trim(),
        Ist: $(columns[3]).text().trim(),
      });
    });

    res.status(200).json(allData);
  } catch (error) {
    console.error("Fehler beim Scraping:", error);
    res.status(500).json({ message: "Fehler beim Laden der Daten", error: error.message });
  }
};

module.exports = { scrapePayments, payReport };