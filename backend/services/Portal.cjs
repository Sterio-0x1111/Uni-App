const axios = require("axios");
const cheerio = require("cheerio");
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

class Portal {
    constructor(loginState, cookies) {
        if (new.target === Portal) {
            throw new Error('Die abstrakte Klasse Portal kann nicht instanziiert werden.');
        }

        this._loginState = loginState;
        //this.baseURL = baseURL;
        this.cookies = cookies;
    }

    get loginState(){
        return this._loginState;
    }

    /*get cookies(){
        return this.cookies;
    }

    set cookies(cookie){
        this.cookies = cookie;
    }*/

    deserializeCookieJar = () => {
        return (typeof this.cookies === 'object' && !(this.cookies instanceof CookieJar)) ? CookieJar.deserializeSync(this.cookies) : this.cookies;
    }

    createAxiosClient() {
        return wrapper(axios.create({
            jar: this.deserializeCookieJar(),
            withCredentials: true
        }))
    }

    async login(loginPayload){
        throw new Error('Die abstrakte Methode loginToPortal muss in einer Subklasse implementiert werden.');
    }

    async logout(){
        throw new Error('Die abstrakte Methode logout muss in einer Subklasse implementiert werden.');
    }
}

module.exports = Portal;