const axios = require("axios");
const cheerio = require("cheerio");
const { wrapper } = require("axios-cookiejar-support");
const { CookieJar } = require("tough-cookie");

// Hilfsfunktion zum Abrufen von HTML von einer URL
const fetchHTML = async (url, client = axios) => {
  try {
    const response = await client.get(url);
    return cheerio.load(response.data);
  } catch (error) {
    throw new Error(`Fehler beim Laden der Daten von ${url}: ${error.message}`);
  }
};

// Hilfsfunktion zur Fehlerbehandlung
const handleError = (res, message) => {
  console.error(message);
  res.status(500).json({ error: message });
};

/**
 * Funktion zur Erstellung von Axios Clients.
 * 
 * Die Funktion wird aufgerufen, 
 * um die unterschiedlichen Clients 
 * für die verschiedenen Login Seiten zu erstellen.
 * */
const createAxiosClient = (cookieJar) => {
  const cookies = deserializeCookieJar(cookieJar);
  return wrapper(axios.create({
    jar: cookies, //|| new CookieJar(),    Übergib den CookieJar aus der Session
    withCredentials: true
  }));
};

const deserializeCookieJar = (cookieJar) => {
  return typeof cookieJar === "object" && !(cookieJar instanceof CookieJar) ? CookieJar.deserializeSync(cookieJar) : cookieJar;
};

/*
  Ablauf des Parsings der Noten (in Funktion auslagern)
  1) URL 
  2) GET auf URL mit Client
  3) HTML Page der Response laden
  4) HTML Seite in Cheerio laden
  5) Keyword für Filterung festlegn (Notenspiegel, bmelden...)
  6) Links filtern
  7) richtigen Link (meistens der erste) aus gefilterter Menge ziehen
  8) wiederholen mit nächster Seite

  Benötigte Parameter:
  1) client
  2) keyword
  3) url

  Rückgabe:
    - gefilterte URL für nächste Seite
*/
const getAndParseHTML = async (client, url, keyword, tag = 'a', attribute = 'href') => {
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

const parseExamTables = async () => {
  console.log('UPDATED');
  if (req.session.vscCookies) {

    const client = createAxiosClient(req.session.vscCookies);
    const homepageUrl = 'https://vsc.fh-swf.de/qisserver2/rds?state=user&type=0';

    try {

      const homepageResponse = await getAndParseHTML(client, homepageUrl, 'Meine Prüfungen');
      const generalInformationPageResponse = await getAndParseHTML(client, homepageResponse.filteredURL, 'Info über angemeldete Prüfungen');
      let selectedDegreePageResponse = await getAndParseHTML(client, generalInformationPageResponse.filteredURL, 'Abschluss BA Bachelor');
      let registeredExamsPage = await client.get(selectedDegreePageResponse.filteredURL, { withCredentials: true });
      // TODO: Filterstring ersetzen durch dynamischen Parameter für Abschluss (BA/MA -> Auswahl im Frontend)

      if (!registeredExamsPage.data.includes('Informatik')) {
        selectedDegreePageResponse = await getAndParseHTML(client, generalInformationPageResponse.filteredURL, 'Abschluss BA Bachelor');
        registeredExamsPage = await client.get(selectedDegreePageResponse.filteredURL, { withCredentials: true });
      }

      let $ = cheerio.load(registeredExamsPage.data);

      const ul = $('ul.treelist').eq(1);
      const links = $(ul).find('li a[href]').map((index, element) => $(element).attr('href')).get();
      const course = $(ul).find('li span').map((index, element) => $(element).html().replace(/[\n\t]/g, '').trim()).get();

      console.log(links);
      console.log(course);

      const response = await client.get(links[0], { withCredentials: true });
      const html = response.data;

      $ = cheerio.load(html);

      const table = $('table').eq(1);
      const rows = $(table).find('tr');
      const headers = $(table).find('th');

      const tableHeaders = $(headers).map((index, header) => $(header).text().trim()).get();
      const tableData = [];

      $(rows.slice(1)).each((index, row) => {
        const cells = $(row).find('td').map((i, cell) => $(cell).text()).get();
        tableData.push(cells);
      })

      const clearedTable = tableData.map(item => item.map(item2 => item2.replace(/\t/g, '').replace(/\n/g, '').trim()));

      let resCode = 200;
      let data = clearedTable;

      if (clearedTable.length === 0) {
        resCode = 200;
        data = 'Keine Daten gefunden.';
      }

      res.status(resCode).json({ data: data });

    } catch (error) {
      console.log('Fehler beim Laden der angemeldeten Prüfungen', error);
      res.status(500).json({ error: 'Fehler beim Laden der angemeldeten Prüfungen.' });
    }
  } else {
    console.log('VSC: Nicht eingeloggt.');
    res.status(401).send('Nicht eingeloggt!');
  }
}

// Hilfsfunktion zur Überprüfung der Erreichbarkeit eines Links
const checkLink = async (url) => {
  try {
    const response = await axios.get(url);
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

module.exports = { fetchHTML, handleError, createAxiosClient, deserializeCookieJar, getAndParseHTML, checkLink };