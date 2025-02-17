const { fetchHTML, handleError } = require("../utils/helpers.cjs");
const axios = require('axios');
const cheerio = require('cheerio');
const DepartmentService = require('../services/DepartmentService.cjs');

/**
 * Endpunkt zum Laden der Fachbereiche.
 * 
 * Der Endpunkt nutzt die Klasse DepartmentService 
 * und lädt die im Frontend auswählbaren Fachbereiche.
 * 
 * @async 
 * @function getDepartments
 * 
 * @param {object} req - Anfrageobjekt
 * @param {object} res - Antwortobjekt, enthält die verfügbaren Fachbereiche
 * 
 * @returns {Promise<void>} - Sendet stattdessen eine JSON Antwort mit den Departments und ihren Parsing Type
 */
const getDepartments = async (req, res) => {
    const departments = await DepartmentService.getDepartments();
    (departments.length > 0) ? res.status(200).json({ departments: departments }) : res.status(204).json({ departments: departments });
}

/**
 * Endpunkt zum Laden von Fachbereichsterminen.
 * 
 * Diese Funktion nimmt einen Fachbereich entgegen,
 * bestimmt die zu verwendende Filterlogik 
 * und lädt die fachbereichsspezifischen Semestertermine.
 * 
 * @async 
 * @function getDepartmentDatesAsTable
 * 
 * @param {string} department - Der Fachbereich, dessen Termine geladen werden sollen.
 * @returns {Promise<void>} - Gibt stattdessen eine Antwort zurück
 */
const getDepartmentDatesAsTable = async (req, res) => {
    const { department } = req.body;
    const tableData = await DepartmentService.getDepartmentDatesAsTable(department);
    return res.status(200).json({ tableData });

    /*const { department } = req.body;
    try {
        const getDepartmentsURL = 'http://localhost:3000/api/departments';
        const getDepartmentsResponse = await axios.get(getDepartmentsURL);
        const availableDepartments = getDepartmentsResponse.data;

        // für dynamische Bestimmung der Filterfunktion
        const methodByType = {
            simple:     filterDepartmentTables,
            link:       filterDepartmentTablesWithLinks,
            text:       filterDepartmentDatesAsList
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
    }*/
}

/**
 * Endpunkt zum Laden von Listenplänen.
 * 
 * Die Funktion lädt die nicht tabellarischen,
 * sondern als Listen bereitgestellten Terminpläne 
 * des jeweiligen Fachbereichs.
 * 
 * @async 
 * @function getDepartmentDatesAsText
 * 
 * @param {object} req - Anfrageobjekt, enthält Fachbereich, dessen Daten geladen werden sollen
 * @param {object} res - Antwortobjekt, sendet geparste Daten 
 * 
 * @returns {Promise<void>} - Gibt stattdessen eine JSON Antwort zurück.
 */
const getDepartmentDatesAsText = async (req, res) => {
    const { department } = req.body;
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
        res.status(200).json({ content });

    } catch (error) {
        console.log('Fehler beim Laden der textuellen Terminübersicht.', error);
        res.status(500).json({ error: error });
    }
}

/**
 * Endpunkt zum erweiterten Filtern von verlinkten Tabellen.
 * 
 * Die Funktion erhält eine URL 
 * und parst die dort zu findenden 
 * Tabellen mit Terminen.
 * 
 * @async
 * @function filterDepartmentTablesByLink
 * 
 * @param {object} req - Anfrageobjekt, enthält URL für zu filternde Tabelle
 * @param {object} res - Antwortobjekt, sendet mehrere Tabellen und die Daten
 * 
 * @returns {Promise<void>} - Gibt stattdessen eine JSON Antwort zurück
 */
const filterDepartmentTablesByLink = async (req, res) => {
    const { url } = req.body;
    const { tables, dates } = await DepartmentService.filterDepartmentTablesByLink(url);

    res.status(200).json({ tables, dates });

    /*try {
        console.log('By Link');
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
    }*/
}

module.exports = { getDepartments, getDepartmentDatesAsTable, getDepartmentDatesAsText, filterDepartmentTablesByLink }