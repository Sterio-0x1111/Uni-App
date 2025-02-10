require("dotenv").config();
const cheerio = require("cheerio");
const { CookieJar } = require("tough-cookie");
const Portal = require("./Portal.cjs");

const VPIS_LOGIN_URL = process.env.VPIS_LOGIN_URL;

class VPISPortalService extends Portal {
  #semester = null;
  #token = null;

  constructor(loginState = false, cookies = new CookieJar()) {
    super(loginState, cookies);
    this.#semester = null;
    this.#token = null;
  }

  get semester() {
    return this.#semester;
  }

  set semester(value) {
    this.#semester = value;
  }

  get token() {
    return this.#token;
  }

  set token(value) {
    this.#token = value;
  }

  /**
   * (De)Serialisierung für die Session
   */
  toSession() {
    // Gibt ein reines JSON-Objekt zurück
    return {
      loginState: this._loginState,
      cookies: this.cookies.toJSON(), // CookieJar -> JSON
      semester: this.#semester,
      token: this.#token,
    };
  }

  static fromSession(sessionData) {
    // Falls noch gar nichts in der Session
    if (!sessionData) return new VPISPortalService(false, new CookieJar());

    // CookieJar aus JSON wiederherstellen
    let jar;
    if (sessionData.cookies)
      jar = CookieJar.deserializeSync(sessionData.cookies);
    else jar = new CookieJar();

    // Instanz bauen
    const instance = new VPISPortalService(sessionData.loginState, jar);

    // Semester & Token übernehmen
    instance.semester = sessionData.semester || null;
    instance.token = sessionData.token || null;

    return instance;
  }

  /**
   * Statische Methode, die aus req.session eine Instanz erzeugt und ggf. 401 zurückgibt.
   */
  static verifySession(req, res) {
    const vpisService = VPISPortalService.fromSession(req.session.vpis);

    if (!vpisService.loginState) {
      res.status(401).json({ message: "Nicht eingeloggt. Bitte zuerst anmelden." });
      return null;
    }
    return vpisService;
  }

  /**
   *  Login
   */
  async login({ username, password }) {
    try {
      const client = this.createAxiosClient();
      const getResponse = await client.get(VPIS_LOGIN_URL);
      const $ = cheerio.load(getResponse.data);

      // Parse Login-Action
      const formAction = $("form.vpis-form1").attr("action"); // z. B. "WS2024/..."
      const baseURL = `https://vpis.fh-swf.de/${formAction}`;

      // formData vorbereiten
      const formData = new URLSearchParams();
      formData.append("Template", "2021");
      formData.append("availwidth", 1920);
      formData.append("screenwidth", 1920);
      formData.append("windowouterwidth", 1918);
      formData.append("windowinnerwidth", 1200);
      formData.append("benutzerkennung", username);
      formData.append("passwd", password);
      formData.append("submit", "");

      // POST -> Login
      const loginResponse = await client.post(baseURL, formData.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });

      // Semester/Token aus der finalen URL extrahieren
      const parts = loginResponse.request.res.responseUrl.split("/");
      this.#semester = parts[3]; // z.B. "WS2024"
      this.#token = parts[5]; // z.B. "abc123token"

      // Erfolg prüfen
      const html = loginResponse.data;
      if (
        html.includes("<th>Datum / Uhrzeit</th>") ||
        html.includes("H&ouml;rer-<br/>status")
      ) {
        this._loginState = true;
        // Cookies aktualisieren
        this.cookies = client.defaults.jar;
      } else {
        throw new Error("Login fehlgeschlagen: Ungültige Anmeldedaten?");
      }
    } catch (error) {
      throw new Error("Fehler beim VPIS-Login: " + error.message);
    }
  }

  /**
   *  Logout
   */
  async logout() {
    if (!this._loginState) {
      return "VPIS bereits ausgeloggt.";
    }

    try {
      const client = this.createAxiosClient();

      const logoutURL = `https://vpis.fh-swf.de/${
        this.#semester
      }/student.php3/${this.#token}/logout?Template=2021`;

      const resp = await client.get(logoutURL);

      if (resp.data.includes("neu anmelden")) {
        this._loginState = false;

        // Cookies zurücksetzen
        this.cookies = new CookieJar();
        return "VPIS: Erfolgreich ausgeloggt.";
      } else {
        throw new Error(
          "Logout fehlgeschlagen: Kein 'neu anmelden' im HTML gefunden."
        );
      }
    } catch (error) {
      throw new Error("Fehler beim VPIS-Logout: " + error.message);
    }
  }
}

module.exports = VPISPortalService;