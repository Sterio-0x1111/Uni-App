const { fetchHTML } = require("./helpers.cjs");

// Funktion zum Extrahieren von Infobox-Daten
const extractInfoBoxText = ($, selector) => {
  return $(selector).map((i, element) => $(element).text().trim()).get();
};

// Funktion zum Extrahieren von Prüfungsplänen
const extractPlans = ($, selector) => {
  const plans = [];
  $(selector).each((i, item) => {
    const title = $(item).find(".accordion__head-content h3").text().trim();
    const planLinks = [];
    $(item)
      .find(".accordion__body-inner a")
      .each((j, link) => {
        const planTitle = $(link).text().trim();
        const planUrl = `https://www.fh-swf.de${$(link).attr("href")}`;
        planLinks.push({ title: planTitle, url: planUrl });
      });
    if (title && planLinks.length > 0) {
      plans.push({ title, plans: planLinks });
    }
  });
  return plans;
};

// Funktion zum Extrahieren von Prüfungsplänen (praesenzStudiengaenge, verbundStudiengaenge)
const scrapeCourses = async (url) => {
  const $ = await fetchHTML(url);

  const praesenzStudiengaenge = [];
  const verbundStudiengaenge = [];
  const courseNamesSet = new Set();

  // Präsenz- und Verbundstudiengänge in einer Liste
  $(".bubble-box__wrapper .list-wrapper__item").each((i, element) => {
    const name = $(element).find(".link__text").first().text().trim();
    const link = $(element).find("a").attr("href");

    // Erkennen, ob der Kurs "Life Science Engineering" ist und spezielle Prüfungspläne hat
    const isLSE =
      name.toLowerCase().includes("life science engineering") ||
      name.toLowerCase().includes("lse");

    if (isLSE && !courseNamesSet.has("Life Science Engineering M.Sc.")) {
      const course = {
        name: "Life Science Engineering M.Sc. (berufsbegleitendes Verbundstudium)",
        link: link.startsWith("http") ? link : `https://www.fh-swf.de${link}`,
        additionalInfo: "Anmeldung auf Moodle erforderlich",
        additionalLinks: [],
      };

      // Zusätzliche Links für LSE-Prüfungspläne
      $(element)
        .find("ul.list-wrapper--dots .list-wrapper__item a")
        .each((j, subElement) => {
          const subLink = $(subElement).attr("href");
          const subName = $(subElement).text().trim();
          course.additionalLinks.push({
            name: subName,
            link: subLink.startsWith("http")
              ? subLink
              : `https://www.fh-swf.de${subLink}`,
          });
        });

      verbundStudiengaenge.push(course);
      courseNamesSet.add("Life Science Engineering M.Sc.");
    } else if (!isLSE && !courseNamesSet.has(name)) {
      // Falls kein LSE-Kurs, normalen Kurs einfügen
      const course = {
        name,
        link: link.startsWith("http") ? link : `https://www.fh-swf.de${link}`,
      };

      const isVerbund =
        name.toLowerCase().includes("berufsbegleitendes verbundstudium") ||
        name.toLowerCase().includes("verbund");

      if (isVerbund) {
        verbundStudiengaenge.push(course);
      } else {
        praesenzStudiengaenge.push(course);
      }

      courseNamesSet.add(name);
    }
  });

  return { praesenzStudiengaenge, verbundStudiengaenge };
};

module.exports = { extractInfoBoxText, extractPlans, scrapeCourses };