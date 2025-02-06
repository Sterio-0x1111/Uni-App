const { extractInfoBoxText, extractPlans, scrapeCourses } = require("./scrapeHelper.cjs");

/**
 * Extrahiert einheitliche Daten anhand der übergebenen Konfiguration.
 * Alle Inhalte innerhalb des selektierten Containers werden in ein Array infoBoxes übernommen,
 * wobei jeder Eintrag ein Objekt mit den Keys "type" (z.B. "p", "h3", "ul", "div", "a") und "text" ist.
 * Bei <a>-Elementen wird zusätzlich der href-Wert gespeichert.
 *
 * @param {CheerioStatic} $ - das geparste HTML
 * @param {Object} config - Konfiguration für die Extraktion
 *   - contentSelector: CSS-Selektor, der den zu verarbeitenden Container angibt
 *   - planSelector: (optional) für Prüfungspläne
 *   - infoBoxSelector: (optional) für klassische Infoboxen (wird hier nicht verwendet, wenn nur contentSelector gewünscht ist)
 *   - courseUrl: (optional) URL für zusätzliche Kursdaten
 * @returns {Promise<Object>} - Objekt mit den Schlüsseln infoBoxes, plans, courses
 */
const extractUnifiedData = async ($, config = {}) => {
  const infoBoxes = [];

  // Extrahiere klassische Infoboxen, falls ein entsprechender Selektor vorhanden ist.
  if (config.infoBoxSelector) {
    const classicInfo = extractInfoBoxText($, config.infoBoxSelector);
    classicInfo.forEach(text => {
      infoBoxes.push({ type: "p", text });
    });
  }

  // Verarbeite Inhalte des angegebenen Containers, falls definiert.
  if (config.contentSelector) {
    const $container = $(config.contentSelector);

    // Schleife durch die direkten Kindelemente des Containers.
    $container.children().each((_, element) => {
      const $el = $(element);
      const tag = $el.prop("tagName").toLowerCase();

      // Je nach Tag verarbeite den Inhalt.
      if (["h3", "p", "div", "strong"].includes(tag)) {
        const text = $el.text().trim();
        infoBoxes.push({ type: tag, text });
      } else if (tag === "ul") {
        const items = $el.find("li").map((_, li) => $(li).text().trim()).get();
        infoBoxes.push({ type: tag, text: items.join(", ") });
      } else if (tag === "a") {
        const linkText = $el.text().trim();
        const href = $el.attr("href") || "";
        infoBoxes.push({ type: tag, text: linkText, href });
      }
    });

    // Füge zusätzliche verschachtelte Links im Container hinzu, sofern nicht redundant.
    $container.find("a").each((_, element) => {
      const $el = $(element);
      const linkText = $el.text().trim();
      const href = $el.attr("href") || "";

      // Prüfe, ob der Link bereits existiert, bevor er hinzugefügt wird.
      if (!infoBoxes.some(item => item.type === "a" && item.text === linkText && item.href === href)) {
        infoBoxes.push({ type: "a", text: linkText, href });
      }
    });
  }

  // Extrahiere Prüfungspläne, falls ein Selektor angegeben ist.
  const plans = config.planSelector ? extractPlans($, config.planSelector) : [];

  // Lade zusätzliche Kursdaten, falls eine URL definiert ist.
  const courses = config.courseUrl ? await scrapeCourses(config.courseUrl) : null;

  return {
    infoBoxes,
    plans,
    courses
  };
};

module.exports = { extractUnifiedData };