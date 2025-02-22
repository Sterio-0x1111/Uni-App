const { fetchHTML } = require("./helpers.cjs");

// Funktion zum Extrahieren von Infobox-Daten
const extractInfoBoxText = ($, selector) => 
  $(selector).map((_, element) => $(element).text().trim()).get();

// Funktion zum Extrahieren von Prüfungsplänen
const extractPlans = ($, selector) => {
  const plans = [];
  $(selector).each((_, item) => {
    const $item = $(item);
    const title = $item.find(".accordion__head-content h3").text().trim();
    const planLinks = [];
    $item.find(".accordion__body-inner a").each((_, link) => {
      const $link = $(link);
      const planTitle = $link.text().trim();
      const planUrl = `https://www.fh-swf.de${$link.attr("href")}`;
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

  // Präsenz- und Verbundstudiengänge in der Standardliste
  $(".bubble-box__wrapper .list-wrapper__item").each((_, element) => {
    const $el = $(element);
    const name = $el.find(".link__text").first().text().trim();
    const link = $el.find("a").attr("href");

    const isVerbund =
      name.toLowerCase().includes("berufsbegleitendes verbundstudium") ||
      name.toLowerCase().includes("verbund");
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

      $el.find("ul.list-wrapper--dots .list-wrapper__item a")
         .each((_, subElement) => {
           const $subEl = $(subElement);
           const subLink = $subEl.attr("href");
           const subName = $subEl.text().trim();
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
      const course = {
        name,
        link: link.startsWith("http") ? link : `https://www.fh-swf.de${link}`,
      };
      if (isVerbund) {
        verbundStudiengaenge.push(course);
      } else {
        praesenzStudiengaenge.push(course);
      }
      courseNamesSet.add(name);
    }
  });

  // Verbundstudiengänge in der Accordion-Komponente (Maschinenbau)
  $(".accordion__item").each((_, element) => {
    const $el = $(element);
    const name = $el.find(".headline--3").first().text().trim();
    const link = $el.find(".wysiwyg a").attr("href");
    if (!courseNamesSet.has(name)) {
      const course = {
        name,
        link: link
          ? link.startsWith("http")
            ? link
            : `https://www.fh-swf.de${link}`
          : "N/A",
        additionalInfo: "Anmeldung auf Moodle erforderlich",
        additionalLinks: [],
      };
      verbundStudiengaenge.push(course);
      courseNamesSet.add(name);
    }
  });

  return { praesenzStudiengaenge, verbundStudiengaenge };
};

module.exports = { extractInfoBoxText, extractPlans, scrapeCourses };