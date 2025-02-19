const { availableMemory } = require('process');
const Portal = require('./Portal.cjs');
const cheerio = require('cheerio');
const { CookieJar } = require('tough-cookie');

/**
 * Klasse zur Abwicklung des VSC Logins und Logouts.
 * 
 * Die Klasse bietet Methoden zum Authentifizieren im VSC.
 * Außerdem werden Methoden bereitgestellt, 
 * die Daten aus dem VSC laden.
 * 
 * @author Emre Burak Koc
 */
class VSCPortalService extends Portal {
    /**
     * Konstruktor zum Initialisieren eines VSCPortalService Objekts.
     * 
     * Der Konstruktor nimmt die Parameter entgegen 
     * und ruft die Superklasse auf, 
     * um die Instanziierung durchuzuführen.
     * 
     * @param {boolean} loginState - Status, ob man eingeloggt ist oder nicht
     * @param {CookieJar} cookies - Die Cookies, falls Objekt aus Session geladen wird
     * @param {string} baseURL - Die Basis URL, von der aus begonnen wird
     */
    constructor(loginState = false, cookies = new CookieJar(), baseURL = process.env.VSC_HOMEPAGE_URL) {
        super(loginState, cookies, baseURL);
    }

    /**
     * Hilfsmethode zum Navigieren zur Zielseite.
     * 
     * DIe Methode parst einige Links von der VSC Seite, 
     * um sich dadurch zu navigieren und die richtige Seite zu erreichen, 
     * auf der Zieldaten zu finden sind. 
     * 
     * @param {axios.AxiosInstance} client - Axios Client zur Durchführung von Requests mit Cookies
     * @param {string} url - Die aufzurufende URL
     * @param {string} keyword - Das Schlüsselwort, nach dem gesucht werden soll, um den Link holen
     * @param {string} tag - Der HTML Tag, nach dem gesucht werden soll
     * @param {string} attribute - Das HTML Attribut, nach dem gesucht werden soll
     * 
     * @returns {object} - Link zur nächsten Seite (Navigation) und vorherige HTML Seite
     */
    async getAndParseHTML(client, url, keyword, tag = 'a', attribute = 'href') {
        const response = await client.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        const filteredLinks = $(tag).filter(function () {
            return $(this).text().includes(keyword);
        });

        const filteredURL = filteredLinks.first().attr('href');
        return {
            filteredURL,
            html
        };
    }

    /**
     * Methode zur Erstellung des Objektzustands.
     * 
     * Die Methode erstellt ein Objekt, 
     * welches den Zustand der Instanz repräsentiert 
     * und zur Speicherung in der Session genutzt wird, 
     * sodass hinterher eine Instanz  wiederhergestellt werden kann. 
    * @returns 
     */
    toSession() {
        // Gibt ein reines JSON-Objekt zurück
        return {
            loginState: this._loginState,
            cookies: this.cookies.toJSON(), // CookieJar -> JSON
            baseURL: this.baseURL,
        };
    }

    static fromSession(sessionData) {
        const instance = super.fromSession(sessionData, VSCPortalService);
        return instance;
    }

    async login(loginPayload) {
        const loginPageURL = 'https://vsc.fh-swf.de/qisserver2/rds?state=user&type=1&category=auth.login&startpage=portal.vm&breadCrumbSource=portal';
        const client = this.createAxiosClient();

        try {
            const response = await client.post(loginPageURL, loginPayload, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                }
            });

            const data = response.data;
            const state = data.includes('Meine Prüfungen');
            console.log('VSCPortalService: ', state);
            this._loginState = state;
            return state;

        } catch (error) {
            console.log('Failed to login to VSC.', error);
            //res.status(500).send('Fehler beim Login.');
            return false;
        }
    }

    async logout() {
        try {
            const client = this.createAxiosClient();
            const url = this.baseURL;
            const response = await client.get(url);
            const $ = cheerio.load(response.data);

            const filteredLinks = $('a').filter(function () {
                return $(this).text().includes('bmelden');
            });

            const logoutURL = filteredLinks.first().attr('href');

            const logoutResponse = await client.get(logoutURL);
            const data = logoutResponse.data;
            if(data.includes('Sicherheitshinweis')){
                this._loginState = false;
                this.cookies = new CookieJar();
                return true;
            }
            return false;

            //return (data.includes('Sicherheitshinweis')) ? true : false;
        } catch (error) {
            console.log('VSC: Fehler beim Ausloggen.\n', error);
        }
    }

    async getDegreesAndCourses() {
        const client = this.createAxiosClient();
        const homepageUrl = this.baseURL;
        const availableDegrees = ['Abschluss BA Bachelor'];

        try {
            const homepageResponse = await this.getAndParseHTML(client, homepageUrl, 'Meine Prüfungen');
            const generalInfoResponse = await this.getAndParseHTML(client, homepageResponse.filteredURL, 'Info über angemeldete Prüfungen');

            // Bachelor-Daten abrufen
            const bachelorData = await this.getDegreeData(client, generalInfoResponse, availableDegrees[0]);

            let masterCourses = null;
            if (bachelorData.html.includes('Master')) {
                availableDegrees.push('Abschluss MA Master');
                masterCourses = await this.getDegreeData(client, generalInfoResponse, availableDegrees[1]);
            }

            return {
                degrees: availableDegrees,
                bachelorPage: this.filterCourses(bachelorData.data),
                masterPage: masterCourses ? this.filterCourses(masterCourses.data, true) : null
            };

        } catch (error) {
            console.error('Fehler beim Laden der angemeldeten Prüfungen', error);
            return { error: 'Fehler beim Laden der angemeldeten Prüfungen.' };
        }
    }

    /**
     * Hilfsfunktion zum Abruf von Studiengangsdaten.
     * 
     * Die Methode führt die in Navigation fort 
     * und sorgt dafür, dass die Liste auf der Seite 
     * korrekt zugeklappt und aufgeklappt wird.
     * 
     * @async
     * @function getDegreeData
     * 
     * @param {AxiosInstance} client - Der Axios Client, mit denen die Anfragen durchgeführt werden
     * @param {string} generealInfoResponse - Die Seite, auf die Studiengänge gefiltert werden
     * @param {string} degree - Der Abschluss, dessen Studiengänge geladen werden sollen (Bachelor / Master)
     * @param {string} keyword - Der Begriff nach dem gesucht wird, um das Listenverhalten korrekt zu steuern
     * 
     * @returns {object} {} - Das Ergebnisobjekt, dass die Ergebnisseite enthält
     */
    async getDegreeData(client, generalInfoResponse, degree, keyword = 'Diesen Zweig zuklappen') {
        let degreePage = await this.getAndParseHTML(client, generalInfoResponse.filteredURL, degree);
        let examsPage = await client.get(degreePage.filteredURL, { withCredentials: true });

        // Falls die Daten nicht direkt verfügbar sind, nochmal abrufen
        if (!examsPage.data.includes(keyword)) {
            degreePage = await this.getAndParseHTML(client, generalInfoResponse.filteredURL, degree);
            examsPage = await client.get(degreePage.filteredURL, { withCredentials: true });
        }

        return { data: examsPage.data, html: examsPage.data };
    }

    /*async getDegreesAndCourses() {
        const client = this.createAxiosClient();
        const homepageUrl = this.baseURL;
        const availableDegrees = ['Abschluss BA Bachelor'];

        try {
            const homepageResponse = await this.getAndParseHTML(client, homepageUrl, 'Meine Prüfungen');
            const generalInformationPageResponse = await this.getAndParseHTML(client, homepageResponse.filteredURL, 'Info über angemeldete Prüfungen');

            let degreeSelectionPage = await this.getAndParseHTML(client, generalInformationPageResponse.filteredURL, availableDegrees[0]);

            let masterPage = null;
            let masterData = null;

            if (degreeSelectionPage.html.includes('Master')) {
                availableDegrees.push('Abschluss MA Master');
                masterPage = await this.getAndParseHTML(client, generalInformationPageResponse.filteredURL, availableDegrees[1]);

                let masterExamsPage = await client.get(degreeSelectionPage.filteredURL, { withCredentials: true });

                if (!masterExamsPage.data.includes('Diesen Zweig zuklappen')) {
                    masterPage = await this.getAndParseHTML(client, generalInformationPageResponse.filteredURL, availableDegrees[1]);
                    masterExamsPage = await client.get(masterPage.filteredURL, { withCredentials: true });
                }
                masterData = masterExamsPage.data;
            }

            let examsPage = await client.get(degreeSelectionPage.filteredURL, { withCredentials: true });

            if (!examsPage.data.includes('Diesen Zweig zuklappen')) {
                degreeSelectionPage = await this.getAndParseHTML(client, generalInformationPageResponse.filteredURL, availableDegrees[0]);
                examsPage = await client.get(degreeSelectionPage.filteredURL, { withCredentials: true });
            }

            const data = examsPage.data;


            // Filterung
            const bachelorCourses = this.filterCourses(data);
            const masterCourses = null;

            if(masterData){
                masterCourses = this.filterCourses(masterData, true);
            }

            console.log('GEFILTER: ', bachelorCourses);

            return { degrees: availableDegrees, bachelorPage: bachelorCourses, masterPage: masterCourses };
            //res.status(200).json({ degrees: avaibleDegrees, bachelorPage: data });



        } catch (error) {
            console.log('Fehler beim Laden der angemeldeten Prüfungen', error);
            res.status(500).json({ error: 'Fehler beim Laden der angemeldeten Prüfungen.' });
        }
    }*/

    filterCourses(data, master = false) {
        const $ = cheerio.load(data);
        const ul = $('ul.treelist').eq((master) ? 2 : 1);
        const courses = $(ul).find('li span').map((index, element) => $(element).html().replace(/[\n\t]/g, '').trim()).get();
        return courses;
    }

    async getExamsData(category, degree, course) {
        const homepageURL = this.baseURL;
        const client = this.createAxiosClient();

        try {
            // navigiere zur richtigen Seite
            const homepageResponse = await this.getAndParseHTML(client, homepageURL, 'Meine Prüfungen');
            const categoryResponse = await this.getAndParseHTML(client, homepageResponse.filteredURL, category);

            const res = await this.getDegreeData(client, categoryResponse, degree, course);

            // Parsen der Zielseite nach Ergebnistabelle
            let $ = cheerio.load(res.data);

            const ul = $('ul.treelist').eq((degree.includes('Master')) ? 2 : 1);
            const links = $(ul).find('li a[href]').map((index, element) => $(element).attr('href')).get();
            const courseNames = $(ul).find('li span').map((index, element) => $(element).html().replace(/[\n\t]/g, '').trim()).get();

            const response = await client.get(links[courseNames.indexOf(course)], { withCredentials: true });
            const html = response.data;

            // Parsen der Ergebnistabelle
            $ = cheerio.load(html);
            const table = $('table').eq((degree.includes('Master') ? 2 : 1));
            const rows = $(table).find('tr');
            const headers = $(table).find('th');

            const tableHeaders = $(headers).map((index, header) => $(header).text().trim()).get();
            const tableData = [];

            $(rows.slice(1)).each((index, row) => {
                const cells = $(row).find('td').map((i, cell) => $(cell).text()).get();
                tableData.push(cells);
            })

            const clearedTable = tableData.map(item => item.map(item2 => item2.replace(/\t/g, '').replace(/\n/g, '').trim()));
            return clearedTable;

        } catch (error) {
            console.log(error);
            //res.status(500).send('Fehler beim Laden der Studiengangsinformationen.');
        }
    }
}

module.exports = VSCPortalService;