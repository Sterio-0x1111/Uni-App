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

module.exports = { getSemesterDates }