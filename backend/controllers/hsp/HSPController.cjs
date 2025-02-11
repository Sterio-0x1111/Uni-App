const HSPPortalService = require("../../services/HSPPortalService.cjs");
const Portal = require("../../services/Portal.cjs");
const { CookieJar } = require("tough-cookie");

// Login für HSP
const loginToHSP = async (req, res) => {
  // Wenn Session schon existiert, Service aus Session wiederherstellen
  const existingService = req.session?.hsp
    ? HSPPortalService.fromSession(req.session.hsp)
    : new HSPPortalService(false, new CookieJar());

  // Falls bereits eingeloggt
  if (existingService.loginState) {
    return res.json({ message: "HSP: Bereits eingeloggt." });
  }

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Benutzername/Passwort fehlen" });
  }

  try {
    const hspService = new HSPPortalService(false, new CookieJar());
    await hspService.login({ username, password });

    // Wenn success => loginState == true
    if (hspService.loginState) {
      req.session.loggedInHSP = true;
      // Service in die Session serialisieren
      req.session.hsp = hspService.toSession();
      return res.json({ message: "SUCCESS" });
    } else {
      return res.status(401).json({ message: "FAILURE" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// Logout für HSP
const logoutFromHSP = async (req, res) => {
    return Portal.logoutService(req, res, HSPPortalService, "hsp", "HSP");
};

module.exports = { loginToHSP, logoutFromHSP };