const cheerio = require("cheerio");
const { createAxiosClient } = require("../../utils/helpers.cjs");
const { verifySession } = require("./hspHelpers.cjs");

const scrapeMyS = async (req, res) => {
  if (!verifySession(req, res)) return;
  const payReportURL = "https://hochschulportal.fh-swf.de/qisserver/pages/cm/exa/enrollment/info/start.xhtml?_flowId=studyservice-flow&_flowExecutionKey=e1s1";

  try {
    const client = createAxiosClient(req.session.hspCookies);
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

      const response = await client.post(payReportURL, formData.toString(), {
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
    res.status(200).json(extractedData);
  } catch (error) {
    console.error("Fehler beim Abrufen des PayReports:", error);
    res.status(500).json({
      message: "Fehler beim Laden des PayReports",
      error: error.message,
    });
  }
};



module.exports = { scrapeMyS };