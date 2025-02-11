require("dotenv").config();
const cheerio = require("cheerio");
const { CookieJar } = require("tough-cookie");
const Portal = require("./Portal.cjs");

const HSP_LOGIN_URL = process.env.HSP_LOGIN_URL;

class HSPPortalService extends Portal {
  #viewState = null;
  #authenticityToken = null;

  constructor(loginState = false, cookies = new CookieJar()) {
    super(loginState, cookies);
  }

  get viewState() {
    return this.#viewState;
  }

  get authenticityToken() {
    return this.#authenticityToken;
  }

  /**
   * (De)Serialisierung für die Session
   */
  toSession() {
    return {
      loginState: this._loginState,
      cookies: this.cookies.toJSON(), // CookieJar -> JSON
      viewState: this.#viewState,
      authenticityToken: this.#authenticityToken,
    };
  }

  static fromSession(sessionData) {
    const instance = super.fromSession(sessionData, HSPPortalService);
    instance.#viewState = sessionData.viewState || null;
    instance.#authenticityToken = sessionData.authenticityToken || null;
    return instance;
  }

  static verifySession(req, res) {
    return super.verifySession(req, res, "hsp", HSPPortalService);
  }

  /**
   * Login für HSP
   */
  async login({ username, password }) {
    try {
      const client = this.createAxiosClient();
      const getResponse = await client.get(HSP_LOGIN_URL);
      const $ = cheerio.load(getResponse.data);

      // Wichtige versteckte Felder für den Login extrahieren
      this.#viewState = $('input[name="javax.faces.ViewState"]').val();
      this.#authenticityToken = $('input[name="authenticity_token"]').val();
      const ajaxToken = $('input[name="ajaxToken"]').val();

      // Login-Daten vorbereiten
      const formData = new URLSearchParams();
      formData.append("userInfo", "");
      formData.append("ajax-token", ajaxToken);
      formData.append("javax.faces.ViewState", this.#viewState);
      formData.append("asdf", username);
      formData.append("fdsa", password);
      formData.append("submit", "Anmelden");

      // POST-Request für Login
      const loginResponse = await client.post(
        "https://hochschulportal.fh-swf.de/qisserver/rds?state=user&type=1&category=auth.login",
        formData.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            Referer: HSP_LOGIN_URL,
          },
        }
      );

      const html = loginResponse.data;

      // Prüfen, ob der Login erfolgreich war
      if (html.includes("Chiporello-Bild-Upload")) {
        this._loginState = true;
        // Cookies aktualisieren
        this.cookies = client.defaults.jar;
      } else {
        throw new Error("Login fehlgeschlagen: Ungültige Anmeldedaten?");
      }
    } catch (error) {
      throw new Error("Fehler beim HSP-Login: " + error.message);
    }
  }

  /**
   * Logout für HSP
   */
  async logout() {
    if (!this._loginState) {
      return "HSP bereits ausgeloggt.";
    }

    try {
      const client = this.createAxiosClient();
      const logoutURL =
        "https://hochschulportal.fh-swf.de/qisserver/rds?state=user&type=1&category=auth.logout";

      const response = await client.get(logoutURL);
      const data = response.data;

      if (data.includes("sukzessive")) {
        this._loginState = false;
        this.cookies = new CookieJar();
        return "HSP: Erfolgreich ausgeloggt.";
      } else {
        throw new Error(
          "Logout fehlgeschlagen: Kein 'sukzessive' im HTML gefunden."
        );
      }
    } catch (error) {
      throw new Error("Fehler beim HSP-Logout: " + error.message);
    }
  }
}

module.exports = HSPPortalService;