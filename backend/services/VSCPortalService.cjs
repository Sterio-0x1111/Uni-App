const { availableMemory } = require('process');
const Portal = require('./Portal.cjs');
const cheerio = require('cheerio');
const { CookieJar } = require('tough-cookie');

class VSCPortalService extends Portal {
    constructor(loginState = false, cookies = new CookieJar()) {
        super(loginState, cookies);
    }

    static fromJSON(jsonString){
        const data = JSON.parse(jsonString);
        return new VSCPortalService(data._loginState, data.cookies);
    }

    async getAndParseHTML(client, url, keyword, tag = 'a', attribute = 'href') {
        const response = await client.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        const filteredLinks = $(tag).filter(function () {
            return $(this).text().includes(keyword);
        });
        //console.log(filteredLinks);

        const filteredURL = filteredLinks.first().attr('href');
        return {
            filteredURL,
            html
        };
    }

    async login(loginPayload) {
        const loginPageURL = 'https://vsc.fh-swf.de/qisserver2/rds?state=user&type=1&category=auth.login&startpage=portal.vm&breadCrumbSource=portal';
        const client = this.createAxiosClient();

        try {
            console.log('Payload');
            console.log(loginPayload);
            const response = await client.post(loginPageURL, loginPayload, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                }
            });

            const data = response.data;
            const state = data.includes('Meine Prüfungen');
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
            const url = process.env.VSC_HOMEPAGE_URL;
            const response = await client.get(url);
            const $ = cheerio.load(response.data);

            const filteredLinks = $('a').filter(function () {
                return $(this).text().includes('bmelden');
            });

            const logoutURL = filteredLinks.first().attr('href');

            const logoutResponse = await client.get(logoutURL);
            const data = logoutResponse.data;

            return (data.includes('Sicherheitshinweis')) ? true : false;
        } catch (error) {
            console.log('VSC: Fehler beim Ausloggen.\n', error);
        }
    }

    async getDegreesAndCourses() {
        const client = this.createAxiosClient();
        const homepageUrl = process.env.VSC_HOMEPAGE_URL;
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
            return { degrees: availableDegrees, bachelorPage: data, m: masterData };
            //res.status(200).json({ degrees: avaibleDegrees, bachelorPage: data });



        } catch (error) {
            console.log('Fehler beim Laden der angemeldeten Prüfungen', error);
            res.status(500).json({ error: 'Fehler beim Laden der angemeldeten Prüfungen.' });
        }
    }

    async getExamsData(category, degree, course) {
        console.log('DEBUG');
        const homepageURL = process.env.VSC_HOMEPAGE_URL;
        const client = this.createAxiosClient();

        try {
            // navigiere zur richtigen Seite
            const homepageResponse = await this.getAndParseHTML(client, homepageURL, 'Meine Prüfungen');
            const categoryResponse = await this.getAndParseHTML(client, homepageResponse.filteredURL, category);
            let degreeResponse = await this.getAndParseHTML(client, categoryResponse.filteredURL, degree);
            let courseResponse = await client.get(degreeResponse.filteredURL, { withCredentials: true });

            // falls Liste mit Studiengängen aufgeklappt ist, um korekte Funktionsweise zu gewährleisten
            if (!courseResponse.data.includes(course)) {
                degreeResponse = await this.getAndParseHTML(client, categoryResponse.filteredURL, degree);
                courseResponse = await client.get(degreeResponse.filteredURL, { withCredentials: true });
            }

            // Parsen der Zielseite nach Ergebnistabelle
            let $ = cheerio.load(courseResponse.data);

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
            console.log('DEBUG 2');
            return clearedTable;

        } catch (error) {
            console.log(error);
            //res.status(500).send('Fehler beim Laden der Studiengangsinformationen.');
        }
    }
}

module.exports = VSCPortalService;