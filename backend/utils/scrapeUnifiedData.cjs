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
  let infoBoxes = [];

  // 1. Extrahiere klassische Infoboxen (falls infoBoxSelector übergeben wurde)
  if (config.infoBoxSelector) {
    const classicInfo = extractInfoBoxText($, config.infoBoxSelector);
    classicInfo.forEach(text => infoBoxes.push({ type: "p", text }));
  }

  // 2. Extrahiere Inhalte aus dem angegebenen Container (contentSelector)
  if (config.contentSelector) {
    const $container = $(config.contentSelector);
    
    // Verarbeitung der direkten Kindelemente
    $container.children().each((_, element) => {
      const $el = $(element);
      const tag = $el.prop("tagName").toLowerCase();

      if (tag === "h3" || tag === "p" || tag === "div" || tag === "strong") {
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
      // Weitere Tags können bei Bedarf ergänzt werden.
    });
    
    // Zusätzlich: Durchsuche verschachtelte <a>-Elemente im Container, falls diese nicht als direkte Kinder erscheinen
    $container.find("a").each((_, element) => {
      const $el = $(element);
      const linkText = $el.text().trim();
      const href = $el.attr("href") || "";
      // Duplikate: Falls ein <a>-Objekt mit demselben Text und href bereits in infoBoxes steht, füge es nicht erneut hinzu.
      const exists = infoBoxes.some(item => item.type === "a" && item.text === linkText && item.href === href);
      if (!exists) {
        infoBoxes.push({ type: "a", text: linkText, href });
      }
    });
  }

  // 3. Extrahiere Prüfungspläne (falls planSelector übergeben wurde)
  let plans = [];
  if (config.planSelector) {
    plans = extractPlans($, config.planSelector);
  }

  // 4. Optional: Lade Kursdaten, falls courseUrl angegeben wurde.
  let courses = null;
  if (config.courseUrl) {
    courses = await scrapeCourses(config.courseUrl);
  }

  return {
    infoBoxes,
    plans,
    courses
  };
};

module.exports = { extractUnifiedData };