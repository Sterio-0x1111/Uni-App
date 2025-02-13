/**
 * Überprüft, ob der Benutzer eingeloggt ist und die notwendigen Session-Daten vorhanden sind.
 * @returns {Boolean} - True, wenn die Session gültig ist, sonst False.
 */
/* const verifySession = (req, res) => {
  if (!req.session.loggedInHSP || !req.session.hspCookies) {
    res.status(401).json({ message: "Nicht eingeloggt. Bitte zuerst anmelden." });
    return false;
  }
  return true;
}; */

/**
 * Extrahiert den FlowExecutionKey aus einer gegebenen URL.
 * @param {String} url - Die URL, aus der der FlowExecutionKey extrahiert werden soll.
 * @returns {String|null} - Der extrahierte FlowExecutionKey oder null, wenn nicht gefunden.
 */
const extractFlowExecutionKey = (url) => {
  try {
    const params = new URL(url).searchParams;
    return params.get('_flowExecutionKey');
  } catch (error) {
    console.error("Fehler beim Extrahieren des FlowExecutionKey:", error);
    return null;
  }
};

module.exports = { extractFlowExecutionKey };