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
    return typeof this.cookies === "object" && !(this.cookies instanceof CookieJar) ? CookieJar.deserializeSync(this.cookies) : this.cookies;
  };

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