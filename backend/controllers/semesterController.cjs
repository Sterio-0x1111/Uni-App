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
        const linkCases = ['FB Informatik und Naturwissenschaften', 'FB Maschinenbau: Präsenzstudium'];
        const textCases = ['FB Agrarwirtschaft', 'FB Bildungs- und Gesellschaftswissenschaften', 'FB Elektrische Energietechnik'];
        
        const $ = cheerio.load(response.data);
        $('select option').each((index, department) => {
            const departmentValue = $(department).val();
            console.log(departmentValue);
            let type = 'simple'; // regulärer Fall, einfache Tabelle
            if(linkCases.includes(departmentValue)){
                type = 'link'; // Sonderfall 1: für Tabellen, die auf andere Tabellen verlinken
            }

            if(textCases.includes(departmentValue)){
                type = 'text';
            }
            departments.push({ department: departmentValue, type });
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
    const { department } = req.body;
    console.log('POST: ', department + 'X');
    try {
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

const getDepartmentDatesAsText = async (req, res) => {
    const department = 'FB Bildungs- und Gesellschaftswissenschaften';
    try {
        const url = 'https://www.fh-swf.de/de/studierende/studienorganisation/vorlesungszeiten/vorlesungzeit.php';
        const response = await axios.get(url);
        let $ = cheerio.load(response.data);

        /*const departments = {
            'FB Agrarwirtschaft': 
        }*/

        //------------

        // Filtern der Überschriften (Semester)
        const headings = []
        const section = $(`section[data-filter="${department}"]`).html();
        $(`section[data-filter="${department}"]`).find('h4 strong').each((index, heading) => {
            headings.push($(heading).html());
        });

        /*const content = [];
        let capture = false;
        $(`section[data-filter="${department}"] article[class="wysiwyg"]`).children().each((index, element) => {
            const tagName = $(element).prop('tagName');
            
            if(tagName === 'H4' && $(element).text().trim() === headings[0]){
                console.log('Start');
                capture = true;
                return;
            }

            if(capture && tagName === 'H4' && $(element).text().trim() === headings[headings.length-1]){
                console.log('End');
                capture = false;
                return;
            }

            if(capture){
                content.push($.html(element));
            }
        });*/

        //-----------

       

        const titles = [];
        $(`section[data-filter="${department}"]`).find('strong').each((index, title) => {
            titles.push($(title).html());
        });

        const lists = [];
        $(`section[data-filter="${department}"]`).find('ul[class="list-wrapper list-wrapper--section-nav mb--24 "]').each((index, list) => {
            const items = [];
            const subitems = [];
            $(list).find('> li').each((index, item) => {
                $(item).find('li').each((index, subitem) => {
                    subitems.push($(subitem).html());
                });
                $(item).find('ul').remove();
                items.push($(item).html());
            });
            lists.push({
                items,
                subitems
            });
        });
        
        res.status(200).json({ headings, titles, lists, section });

    } catch(error){
        console.log('Fehler beim Laden der textuellen Terminübersicht.', error);
        res.status(500).json({ error: error });
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
            console.log(cells);
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
const filterDepartmentTablesWithLinks = ($, dates) => {
    try {
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
        console.log(tableData);
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

module.exports = { getSemesterDates, getFeedbackDates, getSemesterDates, getDepartments, getDepartmentDatesAsTable, getDepartmentDatesAsText, filterDepartmentTablesByLink }