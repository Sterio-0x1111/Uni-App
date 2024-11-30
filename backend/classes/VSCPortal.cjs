const Portal = require('./Portal.cjs');
const cheerio = require('cheerio');

class VSCPortal extends Portal {
    constructor(){
        super();
    }

    async getAndParseHTML(client, url, keyword, tag = 'a', attribute = 'href'){
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

    async getExamsResults(){
        const homepageUrl = 'https://vsc.fh-swf.de/qisserver2/rds?state=user&type=0';
        const client = this.createAxiosClient();

        try {
            const homepageResponse = await this.getAndParseHTML(client, homepageUrl, 'Meine Prüfungen');
            const generalInformationPageResponse = await this.getAndParseHTML(client, homepageResponse.filteredURL, 'Notenspiegel');
            let selectedDegreePageResponse = await this.getAndParseHTML(client, generalInformationPageResponse.filteredURL, 'Abschluss BA Bachelor');
            let registeredExamsPage = await client.get(selectedDegreePageResponse.filteredURL, { withCredentials: true });
            // TODO: Filterstring ersetzen durch dynamischen Parameter für Abschluss (BA/MA -> Auswahl im Frontend)

            if (!registeredExamsPage.data.includes('Diesen Zweig zuklappen')) {
                selectedDegreePageResponse = await this.getAndParseHTML(client, generalInformationPageResponse.filteredURL, 'Abschluss BA Bachelor');
                registeredExamsPage = await client.get(selectedDegreePageResponse.filteredURL, { withCredentials: true });
            }

            let $ = cheerio.load(registeredExamsPage.data);

            const ul = $('ul.treelist').eq(1);
            const links = $(ul).find('li a[href]').map((index, element) => $(element).attr('href')).get();
            const courses = $(ul).find('li span').map((index, element) => $(element).html().replace(/[\n\t]/g, '').trim()).get();
            const course = 'Informatik (PO-Version 19)';
            

            const response = await client.get(links[courses.indexOf(course)], { withCredentials: true });
            const html = response.data;

            $ = cheerio.load(html);
            //console.log(degree.includes('Bachelor'));
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
            console.log('Fehler beim Laden der angemeldeten Prüfungen', error);
            //throw new Error(error);
            return null;
        }
    }

    async login(loginPayload){
        const loginPageURL = 'https://vsc.fh-swf.de/qisserver2/rds?state=user&type=1&category=auth.login&startpage=portal.vm&breadCrumbSource=portal';
        const client = this.createAxiosClient();

        try {
            const response = await client.post(loginPageURL, loginPayload.toString(), {
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
}

module.exports = { VSCPortal };