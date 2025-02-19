const { fetchHTML, handleError } = require("../utils/helpers.cjs");

/**
 * Statische Klasse zur Abwicklung der Semesterlogik.
 * 
 * Die Klasse benötigt keinen Zustand, 
 * weshalb sie statisch deklariert ist. 
 * Die Funktionen hätten auch direkt im Controlle rrealisiert werden können, 
 * jedoch wurde diese Klasse erstellt, 
 * um die Konsistenz und Implementierungsstruktur zu wahren. 
 * 
 * @author Emre Burak Koc
 */
class SemesterService {

    /**
     * Methode zum Laden der Semesterzeiten.
     * 
     * Die Methode lädt die Semesterzeiträume 
     * und führt eine tablleraische Filterung durch.
     * 
     * @async 
     * @function getSemesterDates
     * 
     * @returns {any[]} semesterList - Das Array, dass die geladenen Semesterzeiträume enthält
     */
    static async getSemesterDates(){
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
            
            return semesterList;
        } catch(err){
            console.error('Fehler beim Laden der Semesterdaten.', err);
        }
    }

    /**
     * Methode zum Laden der Rückmeldefristen. 
     * 
     * Die Klasse lädt die Zielseite 
     * und führt eine einfache Filterung durch. 
     * Die Filterung greift auf simple HTML Tags zurück. 
     * Aufgrund der gegebenen Struktur kann ein solch einfaches Parsing realisiert werden. 
     * 
     * @async
     * @function getFeedbackDates
     * 
     * @returns {object} result - Objekt, dass die gefilterten Informationen zur Rückmeldefrist enthält
     */
    static async getFeedbackDates(){
        try{
            const url = 'https://www.fh-swf.de/de/studierende/studienorganisation/vorlesungszeiten/vorlesungzeit.php';
            const $ = await fetchHTML(url);
    
            const targetArticle = $('article.wysiwyg').first().html();
            const headline = $(targetArticle).next('h2').text();
            const nextSemester = $(targetArticle).next('h3').text();
            const nextDate = $(targetArticle).next('h4').text();
            const infoText = $(targetArticle).next('p').text();
    
            const result = { 
                targetArticle, 
                headline,
                nextSemester, 
                nextDate,
                infoText
            }

            return result;
        } catch(error){
            console.error('Fehler beim Laden der Rückmeldeinformationen.', error);
            return result;
        }
    }
}

module.exports = SemesterService;