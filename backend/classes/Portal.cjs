const axios = require("axios");
const cheerio = require("cheerio");
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

class Portal {
    constructor(homepageURL) {
        this.homepageURL = homepageURL;
        this._client = this.createAxiosInstance();
    }

    get client() {
        return this._client;
    }

    /*set client(axiosClient){
        this.client = axiosClient;
    }*/

    createAxiosInstance() {
        return wrapper(axios.create({
            jar: new CookieJar(),
            withCredentials: true
        }));
    }
}

module.exports = Portal;