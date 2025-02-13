const axios = require("axios");
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

class Portal {
  constructor(loginState = false, cookies = new CookieJar(), baseURL) {
    if (new.target === Portal) {
      throw new Error(
        "Die abstrakte Klasse Portal kann nicht instanziiert werden."
      );
    }

    this._loginState = loginState;
    this.cookies = cookies;
    this.baseURL = baseURL;
  }

  get loginState() {
    return this._loginState;
  }

  /*get cookies(){
        return this.cookies;
    }

    set cookies(cookie){
        this.cookies = cookie;
    }*/

  /**
   * Methode zur Erstellung von Axios Clients.
   *
   * Die Methode wird aufgerufen,
   * um die unterschiedlichen Clients
   * für die verschiedenen Login Seiten zu erstellen.
   **/
  createAxiosClient() {
    return wrapper(
      axios.create({
        jar: this.deserializeCookieJar(),
        withCredentials: true,
      })
    );
  }

  deserializeCookieJar = () => {
    return typeof this.cookies === "object" &&
      !(this.cookies instanceof CookieJar)
      ? CookieJar.deserializeSync(this.cookies)
      : this.cookies;
  };

  /**
   * Generische fromSession-Methode für alle Unterklassen.
   *
   * @param {Object} sessionData - Session-Daten des Nutzers
   * @param {Class} PortalClass - Die Portal-Klasse (z.B. HSPPortalService, ...)
   * @returns {Object} Instanz der jeweiligen Portal-Klasse
   */
  static fromSession(sessionData, PortalClass) {
    // Falls noch gar nichts in der Session
    if (!sessionData) return new PortalClass(false, new CookieJar());

    // CookieJar aus JSON wiederherstellen
    let jar = sessionData.cookies
      ? CookieJar.deserializeSync(sessionData.cookies)
      : new CookieJar();
    return new PortalClass(sessionData.loginState, jar);
  }

  /**
   * Überprüft, ob ein Benutzer eingeloggt ist und gibt eine Instanz zurück.
   * Falls nicht, wird eine 401-Fehlermeldung zurückgegeben.
   *
   * @param {String} sessionKey - Der Key, unter dem die Portal-Daten gespeichert sind (z. B. "hsp" oder "vpis")
   * @param {Class} PortalClass - Die Portal-Klasse, die instanziiert werden soll
   * @returns {Object|null} - Die Portal-Instanz oder `null` bei fehlendem Login
   */
  static verifySession(req, res, sessionKey, PortalClass) {
    const sessionData = req.session?.[sessionKey];
    if (!sessionData) {
      console.warn(`Session für ${sessionKey} existiert nicht.`);
      return res
        .status(401)
        .json({ message: "Nicht eingeloggt. Bitte zuerst anmelden." });
    }

    const portalInstance = PortalClass.fromSession(sessionData);
    if (!portalInstance.loginState)
      return res
        .status(401)
        .json({ message: "Nicht eingeloggt. Bitte zuerst anmelden." });
    return portalInstance;
  }

  /**
   * Universelle Login-Funktion für alle Portale
   */
  static async loginService(req, res, PortalClass, sessionKey, serviceName) {
    // Falls eine Session existiert, aus der Session wiederherstellen
    const existingService = req.session?.[sessionKey]
      ? PortalClass.fromSession(req.session[sessionKey])
      : new PortalClass(false, new CookieJar());

    // Falls bereits eingeloggt
    if (existingService.loginState) {
      return res.json({ message: `${serviceName}: Bereits eingeloggt.` });
    }

    // Login-Daten aus dem Request holen
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Benutzername/Passwort fehlen" });
    }

    try {
      const portalService = new PortalClass(false, new CookieJar());
      await portalService.login({ username, password });

      // Wenn success => loginState == true
      if (portalService.loginState) {
        // Service in die Session serialisieren
        req.session[sessionKey] = portalService.toSession();
        return res.json({ message: `${serviceName}: SUCCESS` });
      } else {
        return res.status(401).json({ message: "FAILURE" });
      }
    } catch (error) {
      console.error(`${serviceName}: Fehler beim Login`, error);
      return res.status(500).json({ message: "Login fehlgeschlagen", error: error.message });
    }
  }

  /**
   * Universelle Logout-Funktion für alle Portale
   */
  static async logoutService(req, res, PortalClass, sessionKey, serviceName) {
    if (!req.session?.[sessionKey])
      return res
        .status(200)
        .json({ message: `${serviceName} bereits ausgeloggt.` });
    const serviceInstance = PortalClass.fromSession(req.session[sessionKey]);

    // Falls schon ausgeloggt
    if (!serviceInstance || !serviceInstance.loginState)
      return res
        .status(200)
        .json({ message: `${serviceName} bereits ausgeloggt.` });

    try {
      // Logout durchführen
      const result = await serviceInstance.logout();

      // Session-Daten aktualisieren
      req.session[sessionKey] = serviceInstance.toSession();
      console.log(`${serviceName}: Erfolgreich ausgeloggt.`);
      return res.status(200).json({ message: result });
    } catch (error) {
      console.error(`${serviceName}: Fehler beim Ausloggen.\n`, error);
      return res.status(500).json({
        message: `${serviceName} Logout fehlgeschlagen.`,
        error: error.message,
      });
    }
  }

  async login(loginPayload) {
    throw new Error(
      "Die abstrakte Methode login muss in einer Subklasse implementiert werden."
    );
  }

  async logout() {
    throw new Error(
      "Die abstrakte Methode logout muss in einer Subklasse implementiert werden."
    );
  }
}

module.exports = Portal;