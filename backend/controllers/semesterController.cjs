const { fetchHTML, handleError } = require("../utils/helpers.cjs");
const SemesterService = require('../services/SemesterService.cjs');

/**
 * Controller zur Abwicklung von Operationen bezüglich der Semesterzeiten.
 * 
 * Unterstützte Funktionen:
 * - Semesterzeiten laden
* - Rückmeldefristen laden
 * 
 * 
 */

/**
 * Endpunkt zum Laden der Semesterzeiträume.
 * 
 * Der Endpunkt filtert die Tabelle der Semesterzeiträume, 
 * indem sie diese zeilenweise durchläuft 
 * und die nötigen Daten extrahiert.
 * 
 * @async 
 * @function getSemesterDates
 * 
 * @param {object} req - Anfrageobjekt
 * @param {object} res - Antwortobjekt
 * 
 * @returns {Promise<void>} - stattdessen wird eine JSON Antwort gesendet
 */
const getSemesterDates = async (req, res) => {
    const semesterDates = await SemesterService.getSemesterDates();
    res.status(200).json({ table: semesterDates });
    /*try{
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
    }*/
}

/**
 * Endpunkt zum Laden der Rückmeldedaten.
 * 
 * Der Endpunkt greift auf die Informationen zu, 
 * indem die jeweils spezifischen HTML Elemente 
 * individuell geparst werden.
 * 
 * @async 
 * @function getFeedbackDates
 * 
 * @param {object} req - Anfrageobjekt
 * @param {object} res - Antwortobjekt
 * 
 * @returns {Promise<void>} - Stattdessen wird eine JSON Antwort gesendet
 */
const getFeedbackDates = async (req, res) => {
    const feedbackDates = await SemesterService.getFeedbackDates();
    res.status(200).json({
        targetArticle: feedbackDates.targetArticle,
        headline: feedbackDates.headline,
        nextSemester: feedbackDates.nextSemester,
        nextDate: feedbackDates.nextDate,
        infoText: feedbackDates.infoText
    });
}

module.exports = { getSemesterDates, getFeedbackDates }