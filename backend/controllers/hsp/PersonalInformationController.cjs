const cheerio = require("cheerio");
const HSPPortalService = require("../../services/HSPPortalService.cjs");

const scrapeMyS = async (req, res) => {
  const hspService = HSPPortalService.verifySession(req, res);
  if (!hspService) return;
  
  const PURL = "https://hochschulportal.fh-swf.de/qisserver/pages/cm/exa/enrollment/info/start.xhtml?_flowId=studyservice-flow&_flowExecutionKey=e1s1";

  try {
    const client = hspService.createAxiosClient();

    // Prüfen, ob die Anfrage bereits gesendet wurde
    if (!req.session.isPostRequestDone) {
      const formData = new URLSearchParams();
      formData.append("activePageElementId", "studyserviceForm:fieldsetPersoenlicheData:titleminmax");
      formData.append("refreshButtonClicked", "");
      formData.append("navigationPosition", "hisinoneMeinStudium,hisinoneStudyservice");
      formData.append("authenticity_token", req.session.authenticity_token);
      formData.append("autoScroll", "");
      formData.append("studyserviceForm:fieldsetPersoenlicheData:collapsiblePanelCollapsedState", "value");
      formData.append("javax.faces.partial.event", "click");
      formData.append("javax.faces.behavior.event", "click");
      formData.append("javax.faces.source", "studyserviceForm:fieldsetPersoenlicheData:titleminmax");
      formData.append("javax.faces.partial.ajax", "true");
      formData.append("javax.faces.partial.execute", "studyserviceForm:fieldsetPersoenlicheData");
      formData.append("javax.faces.partial.render", "studyserviceForm:fieldsetPersoenlicheData studyserviceForm:messages-infobox");
      formData.append("studyserviceForm_SUBMIT", "1");
      formData.append("javax.faces.ViewState", "e1s1");
      formData.append("studyserviceForm", "studyserviceForm");

      const response = await client.post(PURL, formData.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });
      const getResponse = await client.get(response.request.res.responseUrl);

      req.session.isPostRequestDone = true;
      req.session.PersonalInformation = getResponse.data;
      await req.session.save();
    }

    const $ = cheerio.load(req.session.PersonalInformation);

    // Prüfungstabellen-Daten extrahieren
    const rows = $("#studyserviceForm\\:stgStudent\\:collapsibleFieldsetCourseOfStudies\\:fieldsetDegreeProgram_1\\:degreeProgramProgresTable\\:degreeProgramProgresTableTable tbody tr");

    const extractedData = rows.map((_, row) => {
      const columns = $(row).find("td");
      return {
        Fach: $(columns[0]).find("span:last-child").text().trim(),
        Fachsemester: $(columns[1]).find("span:last-child").text().trim(),
        Fachkennzeichen: $(columns[2]).find("span:last-child").text().trim(),
        Prüfungsordnungsversion: $(columns[3]).find("span:last-child").text().trim(),
      };
    }).get();

    // Personendaten extrahieren
    const personData = {};
    $("#studyserviceForm\\:fieldsetPersoenlicheData\\:fieldsetPersoenlicheData_innerFieldset .oneLine").each((_, element) => {
      const label = $(element).find(".labelWithBG").text().trim();
      const value = $(element).find(".answer").text().trim();
      if (label && value) {
        personData[label] = value;
      }
    });

    extractedData.push({ personendaten: personData });
    const infoData = await scrapeMyInfo(req, res);
    extractedData.push({ infoData });
    res.status(200).json(extractedData);
  } catch (error) {
    console.error("Fehler beim Abrufen des PayReports:", error);
    res.status(500).json({
      message: "Fehler beim Laden des PayReports",
      error: error.message,
    });
  }
};

const scrapeMyInfo = async (req, res) => {
  const hspService = HSPPortalService.verifySession(req, res);
  if (!hspService) return;
  
  if (!req.session.isPostRequestDone) contactDataURL = "https://hochschulportal.fh-swf.de/qisserver/pages/startFlow.xhtml?_flowId=showOwnContactData-flow&_flowExecutionKey=e1s1";
  else contactDataURL = "https://hochschulportal.fh-swf.de/qisserver/pages/startFlow.xhtml?_flowId=showOwnContactData-flow&_flowExecutionKey=e2s1";

  try {
    const client = hspService.createAxiosClient();

    const formData = new URLSearchParams();
    formData.append("_flowId", "showOwnContactData-flow");
    formData.append("_flowExecutionKey", "e1s1");

    const response = await client.post(contactDataURL, formData.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    const $ = cheerio.load(response.data);

    // Kontaktinformationen extrahieren
    const contactData = [];

    $(".tileFieldsetColumn").each((_, element) => {
      const sectionTitle = $(element).find("h2.withMarginLeft").text().trim();

      const emailElements = $(element).find(".emailDataContainer.tileDataContainer div");
      const emailAddresses = emailElements.map((_, el) => $(el).text().trim()).get();

      const phoneElements = $(element).find(".phoneDataContainer.tileDataContainer div");
      const phoneNumbers = phoneElements.map((_, el) => $(el).text().trim()).get();

      const addressElements = $(element).find(".addressBlock .adressRow");
      const address = addressElements.map((_, el) => $(el).text().trim()).get().join(", ");

      contactData.push({
        section: sectionTitle,
        emails: emailAddresses.length > 0 ? emailAddresses : null,
        phones: phoneNumbers.length > 0 ? phoneNumbers : null,
        address: address || null,
      });
    });

    return { kontaktinformationen: contactData };
  } catch (error) {
    console.error("Fehler beim Abrufen der Kontaktinformationen:", error);
    return {
      message: "Fehler beim Laden der Kontaktinformationen",
      error: error.message,
    };
  }
};

module.exports = { scrapeMyS, scrapeMyInfo };