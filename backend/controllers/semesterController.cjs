const { fetchHTML, handleError } = require("../utils/helpers.cjs");
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Funktion zum Laden der Semesterzeiträume.
 * 
 * @param req 
 * @param res 
 */ 
const getSemesterDates = async (req, res) => {
    try{
        const url = 'https://www.fh-swf.de/de/studierende/studienorganisation/vorlesungszeiten/vorlesungzeit.php';
        const $ = await fetchHTML(url);

        const semesterTable = $('.table').first();
        semesterTable.find('thead').remove();
        
        const semesterList = [];

        semesterTable.find('tr').each((index, row) => {
            const columns = $(row).find('td');
            const semester = $(columns[0]).text(); // betreffendes Semester
            const period = $(columns[1]).text();  // Zeiträume

            semesterList.push({
                semester, 
                period
            })
        })
        
        if(semesterList.length > 0){
            res.json({ table: semesterList });
            console.log('Successfully sent semester periods.');
        } else {
            handleError(res, 'Fehler: Die Semesterdaten konnten nicht geladen werden.');
        }
    } catch(err){
        console.log('Fehler beim Laden der Semesterdaten.', err);
    }
}

const getFeedbackDates = async (req, res) => {
    try{

        const url = 'https://www.fh-swf.de/de/studierende/studienorganisation/vorlesungszeiten/vorlesungzeit.php';
        const $ = await fetchHTML(url);

        const targetArticle = $('article.wysiwyg').first().html();
        const headline = $(targetArticle).next('h2').text();
        const nextSemester = $(targetArticle).next('h3').text();
        const nextDate = $(targetArticle).next('h4').text();
        const infoText = $(targetArticle).next('p').text();

        res.status(200).json({ 
            targetArticle, 
            headline,
            nextSemester, 
            nextDate,
            infoText
         });

    } catch(error){
        console.log('Fehler beim Laden der Rückmeldeinformationen.', error);
    }
}

/**
 * Funktion zum Laden von auswählbaren Fachbereichen.
 */
const getDepartments = async (req, res) => {
    try {
        const url = 'https://www.fh-swf.de/de/studierende/studienorganisation/vorlesungszeiten/vorlesungzeit.php';
        const response = await axios.get(url);
        const departments = [];
        
        const $ = cheerio.load(response.data);
        $('select option').each((index, department) => {
            departments.push($(department).val());
        });
        departments.shift(); // erstes Element ist 'Fachbereich auswählen!', wird nicht benötigt

        res.status(200).json({ departments });
    } catch(error){
        console.log(error);
        res.status(500).send(error);
    }
}

/**
 * Funktion zum Laden von fachbereichsspezifischen Terminen.
 */
const getDepartmentDates = async (req, res) => {
    try {

        const url = 'https://www.fh-swf.de/de/studierende/studienorganisation/vorlesungszeiten/vorlesungzeit.php';


    } catch(error){
        console.log(error);
        res.status(500).send(error);
    }
}

/**
 * Diese Funktion lädt die als Tabelle bereitgestellten fachbereichspezifischen Semestertermine.
 */
const getDepartmentDatesAsTable = async (req, res) => {
    const department = 'FB Informatik und Naturwissenschaften';
    try {
        // department soll später als dynamischer parameter übergeben werden (aus frontend)
        const url = 'https://www.fh-swf.de/de/studierende/studienorganisation/vorlesungszeiten/vorlesungzeit.php';
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // JSON für dynamische Bestimmung der Filter Methode
        const departments = {
            'FB Elektrotechnik und Informationstechnik':    filterDepartmentTables,
            'FB Technische Betriebswirtschaft':             filterDepartmentTables,
            'FB Informatik und Naturwissenschaften':        filterDepartmentTablesWithLinks,
            'FB Maschinenbau: Präsenzstudium':              filterDepartmentTablesWithLinks,
            'FB Maschinenbau: Verbundstudium ':             filterExternalDepartmentTables,
            'FB Ingenieur- und Wirtschaftswissenschaften':  filterDepartmentTables
        }

        const filterMethod = departments[department];
        const dates = $('table').has(`tr[data-filter="${department}"]`).html();
        const tableData = filterMethod($, dates);
        
        res.status(200).json({ tableData });

    } catch(error){
        console.log(`Fehler beim Laden der Termine für den Fachbereich ${department}.`, error);
    }
}

/**
 * Funktion zum Filtern der fachbereichsspezifischen Tabellen.
 */
const filterDepartmentTables = ($, dates) => {
    try {
        const tableData = [];
        $(dates).find('tbody tr').each((index, row) => {
            const cells = $(row).find('td').map((i, cell) => $(cell).text()).get();
            tableData.push(cells);
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
const filterDepartmentTablesWithLinks = ($, dates) => {
    try {
        const baseURL = 'https://www.fh-swf.de';
        const tableData = [];

        $(dates).find('tr').each((index, row) => {
            const name = $(row).text().trim();
            const link = $(row).find('a').map((index, a) => {
                return {
                    name: $(row).text().trim(),
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

/**
 * Funktion zum Filtern von Verweistabellen.
 * 
 * Die Funktion parst parst Tabellen,
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

module.exports = { getSemesterDates, getFeedbackDates, getSemesterDates, getDepartments, getDepartmentDatesAsTable }