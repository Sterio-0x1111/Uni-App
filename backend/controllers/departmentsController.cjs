const { fetchHTML, handleError } = require("../utils/helpers.cjs");
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Funktion zum Laden von auswählbaren Fachbereichen.
 * 
 * Der Endpunkt lädt die verfügbaren Fachbereiche 
 * und kategorisiert diese manuell, 
 * um sie später besser verarbeiten zu können.
 */
const getDepartments = async (req, res) => {
    try {
        const url = 'https://www.fh-swf.de/de/studierende/studienorganisation/vorlesungszeiten/vorlesungzeit.php';
        const response = await axios.get(url);

        // Kategorisierung der Fachbereiche zur späteren Unterscheidung und Verarbeitung
        const linkCases = ['FB Informatik und Naturwissenschaften', 'FB Maschinenbau: Präsenzstudium'];
        const textCases = ['FB Agrarwirtschaft', 'FB Bildungs- und Gesellschaftswissenschaften', 'FB Elektrische Energietechnik'];
        
        const departments = [];
        const $ = cheerio.load(response.data);

        $('select option').each((index, department) => {
            const departmentValue = $(department).val();
            let type = 'simple'; // regulärer Fall, einfache Tabelle
            if(linkCases.includes(departmentValue)){
                type = 'link'; // Sonderfall 1: für Tabellen, die auf andere Tabellen verlinken
            }

            if(textCases.includes(departmentValue)){
                type = 'text'; // Sonderfall 2: für nicht tabellarische Listendarstellung
            }
            departments.push({ department: departmentValue, type });
        });
        departments.shift(); // erstes Element ist 'Fachbereich auswählen!', wird nicht benötigt

        if(departments.length > 0){
            res.status(200).json({ departments });
        } else {
            res.status(204).json({ message: 'Keine Fachbereiche gefunden.' });
        }
        
    } catch(error){
        console.log(error);
        res.status(500).json({ message: 'Fehler beim Laden der verfügbaren Fachbereiche. ' + error });
    }
}

/**
 * Endpunkt zum Laden von Fachbereichsterminen.
 * 
 * Diese Funktion nimmt einen Fachbereich entgegen,
 * bestimmt die zu verwendende Filterlogik 
 * und lädt die fachbereichsspezifischen Semestertermine.
 * 
 * @param department
 *  Der Fachbereich, dessen Termine geladen werden sollen.
 */
const getDepartmentDatesAsTable = async (req, res) => {
    const { department } = req.body;
    try {
        const getDepartmentsURL = 'http://localhost:3000/api/semester/departments';
        const getDepartmentsResponse = await axios.get(getDepartmentsURL);
        const availableDepartments = getDepartmentsResponse.data;

        // für dynamische Bestimmung der Filterfunktion
        const methodByType = {
            simple:     filterDepartmentTables,
            link:       filterDepartmentTablesWithLinks,
            text:       filterDepartmentDatesAsText
        }

        // Zuordnung der zu verwendenden Filterfunktion
        const departments = {};
        availableDepartments.departments.forEach(dep => {
            departments[dep.department] = {
                type: dep.type,
                method: methodByType[dep.type]
            }
        });

        const url = 'https://www.fh-swf.de/de/studierende/studienorganisation/vorlesungszeiten/vorlesungzeit.php';
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // JSON für dynamische Bestimmung der Filter Methode
        /*const departments = {
            'FB Elektrotechnik und Informationstechnik':    filterDepartmentTables,
            'FB Technische Betriebswirtschaft':             filterDepartmentTables,
            'FB Informatik und Naturwissenschaften':        filterDepartmentTablesWithLinks,
            'FB Maschinenbau: Präsenzstudium':              filterDepartmentTablesWithLinks,
            'FB Maschinenbau: Verbundstudium ':             filterExternalDepartmentTables,
            'FB Ingenieur- und Wirtschaftswissenschaften':  filterDepartmentTables
        }*/

        const filterMethod = departments[department].method;
        if(filterMethod){
            const tableData = await filterMethod($, department);
            res.status(200).json( { tableData } );
        } else {
            res.status(204).json({ message: 'Keine Termine gefunden.' });
        }

    } catch(error){
        console.log(`Fehler beim Laden der Termine für den Fachbereich ${department}.`, error);
        res.status(500).json({ message: `Fehler beim Laden der Termine für den Fachbereich ${department}. ` + error });
    }
}

/**
 * Endpunkt zum Laden von Listenplänen.
 * 
 * Die Funktion lädt die nicht tabellarischen,
 * sondern als Listen bereitgestellten Terminpläne 
 * des jeweiligen Fachbereichs.
 * 
 * @param department
 *  Der Fachbereich, dessen Termine geladen werden sollen
 */
const getDepartmentDatesAsText = async (req, res) => {
    const { department } = req.body;
    console.log('ENTERED 2');
    try {
        const url = 'https://www.fh-swf.de/de/studierende/studienorganisation/vorlesungszeiten/vorlesungzeit.php';
        const response = await axios.get(url);
        let $ = cheerio.load(response.data);

        const content = {};
        const section = $(`section[data-filter="${department}"]`).html();
        console.log(section);

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
        res.status(200).json({ content });

    } catch(error){
        console.log('Fehler beim Laden der textuellen Terminübersicht.', error);
        res.status(500).json({ error: error });
    }
}

/**
 * Funktion zum Filtern der fachbereichsspezifischen Tabellen.
 */
const filterDepartmentTables = ($, department) => {
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

    } catch(error){
        console.log('Fehler beim Filtern von Tabellen.', error);
        return null;
    }
}

/**
 * Funktion zum Filtern von fachbereichsspezifischen Tabellen mit Links auf weitere Seiten.
 */
const filterDepartmentTablesWithLinks = ($, department) => {
    try {
        const dates = $('table').has(`tr[data-filter="${department}"]`).html();
        const baseURL = 'https://www.fh-swf.de';
        const tableData = [];

        $(dates).find('tr').each((index, row) => {
            let name = $(row).text().trim();
            const sliceIndex = name.indexOf('\n'); // entferne den Standard "Terminplan finden sie hier"
            
            if(sliceIndex !== -1){
                name = name.slice(0, sliceIndex);
            }

            const link = $(row).find('a').map((index, a) => {
                return {
                    name,
                    url: baseURL + $(a).attr('href')
                }
            }).get(0);
            tableData.push(link);
        })
        return tableData;

    } catch(error){
        console.log('Fehler beim Filtern der Tabellen mit Links.', error);
    }
}

const filterDepartmentTablesByLink = async (req, res) => {
    try {
        const { url } = req.body;
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const tables = [];
        const dates = [];

        const parseTableData = (table = 'table') => {
            const cols1 = [];
            const cols2 = [];

            $(table).find('td').each((index, element) => {
                if(index % 2 === 0){
                    cols1.push($(element).text().trim());
                } else {
                    cols2.push($(element).text().trim());
                }
            });

            const rows = cols1.map((col1, index) => {
                return {
                    date: col1,
                    event: cols2[index]
                }
            });
            return rows;
        }

        if($('article').html()){
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
        res.status(200).json({ tables, dates: dates.value });
        
    } catch(error){
        console.log(error);
    }
}

/**
 * Funktion zum Filtern von Verweistabellen.
 * 
 * Die Funktion parst Tabellen,
 * die selbst keine Auskunft über Termine geben,
 * sondern mit Links auf Moodle verweisen (FB 6).
 * 
 * @param $
 *  Cheerio Objekt, dass die zu parsende Quellseite enthält
 * @param dates
 *  Cheerio Objekt, dass die zu filternde Tabele enthält.
 * 
 * @return tableData
 *  Array, dass JSON Objekte mit den gefilterten Elementen enthält.
 *  
 */
const filterExternalDepartmentTables = ($, dates) => {
    try {

        const tableData = [];
        $(dates).find('tr').each((index, row) => {
            const title = $(row).find('strong').html();
            const link = $(row).find('a').map((index, a) => {
                return {
                    title,
                    course: $(a).find('span').text().trim(),
                    url: $(a).attr('href')
                }
            }).get(0);
            tableData.push(link);
        });
        return tableData;

    } catch(error){
        console.log('Fehler beim Laden der externen Tabellen.', error);
    }
}

const filterDepartmentDatesAsText = async ($, department) => {
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
        console.log('Fehler beim Laden der textuellen Terminübersicht.', error);
        res.status(500).json({ error: error });
    }
}

module.exports = { getDepartments, getDepartmentDatesAsTable, getDepartmentDatesAsText, filterDepartmentTablesByLink }