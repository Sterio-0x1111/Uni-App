/**
 * Überprüft, ob der Benutzer eingeloggt ist und die notwendigen Session-Daten vorhanden sind.
 * @returns {Boolean} - True, wenn die Session gültig ist, sonst False.
 */
const verifySession = (req, res) => {
  if (!req.session.loggedInVPIS || !req.session.vpisCookies) {
    res.status(401).json({ message: "Nicht eingeloggt. Bitte zuerst anmelden." });
    return false;
  }
  return true;
};

module.exports = { verifySession };