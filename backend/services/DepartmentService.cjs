const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Klasse zum Laden von Fachbereichsterminen.
 * 
 * Die Klasse bietet Methoden zum Laden 
 * und Parsen von fachbereichsspezifischen Terminplänen.
 * 
 * @author Emre Burak Koc
 */
class DepartmentService {

    /**
     * Methode zum Filtern der verfügbaren Fachbereiche.
     * 
     * Die statische Methode lädt die verfügbaren Fachbereiche 
     * und ordnet diese in Kategorien ein, 
     * damit hinterher über diese Kategorie die korrekte Filtermethode ausgewählt werden kann.
     * 
     * @async
     * @function getDepartments
     * 
     * @returns {Promise<any[] | undefined>} deparments - die geladenen Fachbereiche mit zugewiesener Kategorie oder undefined
     */
    static async getDepartments() {
        try {
            const url = 'https://www.fh-swf.de/de/studierende/studienorganisation/vorlesungszeiten/vorlesungzeit.php';
            const response = await axios.get(url);

            // Kategorisierung der Fachbereiche zur späteren Unterscheidung und Verarbeitung
            const linkCases = ['FB Informatik und Naturwissenschaften', 'FB Maschinenbau: Präsenzstudium'];
            const textCases = ['FB Agrarwirtschaft', 'FB Bildungs- und Gesellschaftswissenschaften', 'FB Elektrische Energietechnik', 'FB Maschinenbau-Automatisierungstechnik'];
            const moodleCases = ['FB Maschinenbau: Verbundstudium '];

            const cases = {
                'FB Elektrotechnik und Informationstechnik'     : 'simple',
                'FB Technische Betriebswirtschaft'              : 'simple',
                'FB Ingenieur- und Wirtschaftswissenschaften'   : 'simple',
                'FB Maschinenbau: Verbundstudium '              : 'moodle',
                'FB Informatik und Naturwissenschaften'         : 'link',
                'FB Maschinenbau: Präsenzstudium'               : 'link',
                'FB Agrarwirtschaft'                            : 'text',
                'FB Bildungs- und Gesellschaftswissenschaften'  : 'text',
                'FB Elektrische Energietechnik'                 : 'text',
                'FB Maschinenbau-Automatisierungstechnik'       : 'text',
            }

            const departments = [];
            const $ = cheerio.load(response.data);

            $('select option').each((index, department) => {
                const departmentValue = $(department).val();
                let type = 'simple'; // regulärer Fall, einfache Tabelle
                if (linkCases.includes(departmentValue)) {
                    type = 'link'; // Sonderfall 1: für Tabellen, die auf andere Tabellen verlinken
                } else if (textCases.includes(departmentValue)) {
                    type = 'text'; // Sonderfall 2: für nicht tabellarische Listendarstellung
                } else if(moodleCases.includes(departmentValue)){
                    type = 'moodle';
                }
                departments.push({ department: departmentValue, type });
            });
            departments.shift(); // erstes Element ist 'Fachbereich auswählen!', wird nicht benötigt
            departments.pop();  // letztes Element entfernen 'all'

            return departments;
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * Allgemeine Methode zum Auswaählen der richtigen Filtermethode.
     * 
     * Die Methode lädt alle verfübaren Fachbereiche 
     * und weist ihnen basierend auf dem Type eine Filterfunktion zu.
     * Danach wird diese Filterfunktion aufgerufen 
     * und die gefilterten Daten werden zurückgegeben.
     * 
     * @async
     * @function getDepartmentDatesAsTable
     * 
     * @param {string} department - Der ausgewählte Fachbereich, dessen Termine geladen werden sollen
     * @returns {Promise<any>} - Gibt die gefilterten Termine zurück
     */
    static async getDepartmentDatesAsTable(department) {
        try {
            const availableDepartments = await DepartmentService.getDepartments();

            // für dynamische Bestimmung der Filterfunktion
            const methodByType = {
                simple: DepartmentService.filterDepartmentTables,
                link: DepartmentService.filterDepartmentTablesWithLinks,
                text: DepartmentService.filterDepartmentDatesAsList,
                moodle: DepartmentService.filterDepartmentDatesAsMoodleLink,
            }

            // Zuordnung der zu verwendenden Filterfunktion
            const departments = {};
            availableDepartments.forEach(dep => {
                departments[dep.department] = {
                    type: dep.type,
                    method: methodByType[dep.type]
                }
            });

            const url = 'https://www.fh-swf.de/de/studierende/studienorganisation/vorlesungszeiten/vorlesungzeit.php';
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);

            const filterMethod = departments[department].method;
            return await filterMethod($, department);

        } catch (error) {
            console.error(`Fehler beim Laden der Termine für den Fachbereich ${department}.`, error);
        }
    }

    /**
     * Methode zum Laden und Filtern von Text in Listen.
     * 
     * Die Methode lädt die Daten 
     * und filtert den Text aus 
     * Listen heraus.
     * @async 
     * @function getDepartmentDatesAsText
     * 
     * @param {string} department - Fachbereich, dessen Daten geladen werden sollen
     * @returns {Promise<{} | undefined>} content - enthält die gefilterten Daten in aufwändig aufbereiter Form
     */
    static async getDepartmentDatesAsText(department) {
        try {
            const url = 'https://www.fh-swf.de/de/studierende/studienorganisation/vorlesungszeiten/vorlesungzeit.php';
            const response = await axios.get(url);
            let $ = cheerio.load(response.data);

            const content = {};
            const section = $(`section[data-filter="${department}"]`).html();

            // 1. Filterung nach Semestern (h4 Überschriften)
            $(section).find('h4').each((index, heading) => {
                const headingText = $(heading).text().trim();
                const part = $(heading).nextUntil('h4').toArray().map(el => $.html(el)).join('');

                const $2 = cheerio.load(part);
                const strongs = [];

                // 2. Filterung nach Ereignisbegriff (strong)
                $2('strong').each((index, strong) => {
                    const subpart = $2(strong).nextUntil('strong').toArray().map(el => $.html(el)).join('');
                    const $3 = cheerio.load(subpart);
                    const list = new Set(); // Use Set to avoid duplicates

                    // 3. Filterung nach Listenelementen (übergeordnete Liste, da hier verschachtelte Listen zum Einsatz kommen)
                    $3('li.list-wrapper__item').each((_, element) => {
                        const course = $3(element).clone().children('ul').remove().end().text().trim(); // Extract program name
                        const date = $3(element).find('ul.list-wrapper--dots > li.list-wrapper__item').text().trim(); // Extract date

                        if (course && date) {
                            list.add(JSON.stringify({ program: course, date })); // Store as stringified JSON to prevent object duplicates
                        }
                    });

                    strongs.push({
                        title: $2(strong).text().trim(),
                        list: Array.from(list).map(item => JSON.parse(item)) //$3('ul').html()
                    });
                });

                // Zuordnung von Semester und entsprechendem Inhalt (Terminen in diesem Semester)
                content[headingText] = strongs;
            });
            return content;

        } catch (error) {
            console.error('Fehler beim Laden der textuellen Terminübersicht.', error);
        }
    }

    /**
     * Methode zum Filtern der fachbereichsspezifischen Tabellen.
     * 
     * Die Methode verwendet das präparierte Cheerio Objekt 
     * und den ausgewählten Fachbereich, 
     * um die simple tabellerarische Struktur zu parsen.
     * 
     * @function filterDepartmentTables
     * 
     * @param {CheerioObject} $ - Cheerio Objekt mit geladenem Seitencode
     * @param {string} department - ausgewählter Fachbereich, für den Daten geladen werden sollen
     * 
     * @returns tableData
     *  gefilterte Termintabelle als Array
     */
    static filterDepartmentTables($, department) {
        try {
            const tableData = [];
            const dates = $('table').has(`tr[data-filter="${department}"]`).html();
            $(dates).find('tbody tr').each((index, row) => {
                const cells = $(row).find('td').map((i, cell) => $(cell).text()).get();
                tableData.push({
                    event: cells[1],
                    date: cells[0]
                });
            })
            return tableData;

        } catch (error) {
            console.error('Fehler beim Filtern von Tabellen.', error);
        }
    }

    /**
    * Methode zum Filtern von fachbereichsspezifischen Tabellen mit Links auf weitere Seiten.
    * 
    * Die Methode verwendet ein präpariertes Cherio Objekt 
    * und den ausgewählten Fachbereich, 
    * um die spezifischen Tabellen zu filtern, 
    * die selbst keine Daten enthalten, 
    * sondenr auf weitere Tabellen verlinken.
    * 
    * @function filterDepartmentTablesWithLinks
    * 
    * @param {CheerioObject} $ - Cheerio Objekt mit geladenem Seitencode
    * @param {string} department - ausgewählter Fachbereich, für den Daten geladen werden sollen
    * 
    * @returns tableData - gefilterte Termintabelle als Array
    */
    static filterDepartmentTablesWithLinks($, department) {
        try {
            const dates = $('table').has(`tr[data-filter="${department}"]`).html();
            const baseURL = 'https://www.fh-swf.de'; // zum Vervollständigen von relativen Pfaden
            const tableData = [];

            $(dates).find('tr').each((index, row) => {
                let name = $(row).text().trim();
                const sliceIndex = name.indexOf('\n'); // entferne den Standard "Terminplan finden sie hier"

                if (sliceIndex !== -1) {
                    name = name.slice(0, sliceIndex);
                }

                const link = $(row).find('a').map((index, a) => {
                    return {
                        name,
                        url: baseURL + $(a).attr('href') // baue URL, da Quellseite relative Pfade verwendet
                    }
                }).get(0);
                tableData.push(link);
            })
            return tableData;

        } catch (error) {
            console.error('Fehler beim Filtern der Tabellen mit Links.', error);
        }
    }

    /**
     * Methode zum erweiterten Filtern von verlinkten Tabellen.
     * 
     * Die Methode erhält eine URL 
     * und parst die dort zu findenden 
     * Tabellen mit Terminen.
     * 
     * @async 
     * @function filterDepartmentTablesByLink
     * 
     * @param {string} url -  URL zur Seite, die gefiltert werden soll
     * @returns {object} rows - Objekt, dass die zeilenweise gefilterten Daten entählt
     */
    static async filterDepartmentTablesByLink(url) {
        try {
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);

            const tables = [];
            const dates = [];

            const parseTableData = (table = 'table') => {
                const cols1 = [];
                const cols2 = [];
                const headers = [];

                $(table).find('thead th').each((index, element) => headers.push($(element).text().trim()));

                cols1.push(headers[0]);
                cols2.push(headers[1]);

                $(table).find('td').each((index, element) => {
                    const data = $(element).text().trim();
                    (index % 2 === 0) ? cols1.push(data) : cols2.push(data);
                });

                const rows = cols1.map((col1, index) => {
                    return {
                        date: col1,
                        event: cols2[index]
                    }
                });
                return rows;
            }

            if ($('article').html()) {
                $('article').each((index, article) => {
                    const heading = $(article).text().trim();
                    const table = $(article).nextAll('.mb--64').find('table.table').first();

                    tables.push({
                        heading,
                        table: parseTableData(table)
                    });
                });
            } else {
                dates.value = parseTableData();
            }

            return {
                tables,
                dates: dates.value
            }

        } catch (error) {
            console.error('Fehler beim Filtern der Tabellen mit Links.', error);
        }
    }

    /**
     * Methode zum Filtern von Terminen als Listen.
     * 
     * Die Methode nimmt ein Cheerio Objekt 
     * und den ausgeählten Fachbereich, 
     * um die in Listenform aufgeführten Termine zu laden.
     * 
     * @async 
     * @function filterDepartmentDatesAsList
     * 
     * @param {CheerioObject} $ - Cheerio Objekt, dass die zu filternde Seite enthält
     * @param {string} department -  ausgewählter Fachbereich
     * 
     * @returns {object} content - gefilterter Inhalt
     */
    static async filterDepartmentDatesAsList($, department){
        try {
            const url = 'https://www.fh-swf.de/de/studierende/studienorganisation/vorlesungszeiten/vorlesungzeit.php';
            const response = await axios.get(url);
            let $ = cheerio.load(response.data);
    
            const content = {};
            const section = $(`section[data-filter="${department}"]`).html();
            $(section).find('h4').each((index, heading) => {
                const headingText = $(heading).text().trim();
                const part = $(heading).nextUntil('h4').toArray().map(el => $.html(el)).join('');
                const $2 = cheerio.load(part);
                
                const strongs = [];
    
                $2('strong').each((index, strong) => {
                    const subpart = $2(strong).nextUntil('strong').toArray().map(el => $.html(el)).join('');
                    const $3 = cheerio.load(subpart);
    
                    const list = new Set(); // Use Set to avoid duplicates
                    let course = null;
                    let date = null;
    
                    // Filterung der übergeordneten Listen (es werden verschachtelte Listen verwendet)
                    $3('li.list-wrapper__item').each((_, element) => {
                        course = $3(element).clone().children('ul').remove().end().text().trim(); // Ereignis extrahieren
                        date = $3(element).find('ul.list-wrapper--dots > li.list-wrapper__item').text().trim(); // Datum extrahieren
    
                        if (course && date) {
                            list.add(JSON.stringify({ program: course, date })); // Store as stringified JSON to prevent object duplicates
                        }
                    });
    
                    const title = $2(strong).text().trim();
                    const listArray = Array.from(list).map(item => JSON.parse(item));
    
                    strongs.push({
                        title,
                        list: (listArray.length === 0) ? [{ program: title, date: course }] : listArray
                        // Unterscheidung als Fallback, falls Liste leer (=> Vorlesungsbeginn korrekt parsen)
                    });
                });
    
                content[headingText] = strongs;
            });
            return content;
    
        } catch(error){
            console.error('Fehler beim Laden der textuellen Terminübersicht.', error);
        }
    }

    /**
     * Methode zum Filtern von Moodle Links.
     * 
     * Die Methode filtert die Moodle, 
     * die bei einigen Fachbereichen anstelle von Daten gelistet sind.
     * Die eigentlichen Termindaten werden auf Moodle bereitgestellt. 
     * Es wird nur darauf verlinkt, die Filterung wird nicht implementiert, 
     * da eine Moodle Integration nicht im Rahmen dieses Projekts liegt. 
     * 
     * @function filterDepartmentDatesAsMoodleLink
     * 
     * @param {CheerioObject} $ - Cheerio Objekt, dass die Seite enthält
     * @param {string} department - ausgewählter Fachbereich, dessen Moodle Links geladen werden sollen
     * @returns {object} - Objekt, dass die entsprechenden Links und Beschreibungen enthält 
     */
    static filterDepartmentDatesAsMoodleLink($, department) {
        try {
            const dates = $('table').has(`tr[data-filter="${department}"]`).html();
            const tableData = [];

            $(dates).find('tr').each((index, element) => {
                const link = $(element).find('a').text().trim();
                const url = $(element).find('a').attr('href');
                const text = $(element).find('strong').text().trim();

                tableData.push({
                    text,
                    link,
                    url
                })
            });
            return tableData;
        } catch (error) {
            console.error('Fehler beim Filtern der Tabellen mit Links.', error);
        }
    }

}

module.exports = DepartmentService;