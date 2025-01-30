const { fetchHTML, handleError } = require("../utils/helpers.cjs");

class SemesterService {
    //static #instance;
    //#url = 'https://www.fh-swf.de/de/studierende/studienorganisation/vorlesungszeiten/vorlesungzeit.php';
    //$ = null;

    constructor(){
        /*if(SemesterService.#instance){
            return SemesterService.#instance;
        }
        $ = async () => await fetchHTML(this.#url);
        SemesterService.#instance = this;
        console.log('constructed');*/
    }

    /*get instance(){
        if(!SemesterService.#instance){
            SemesterService.#instance = this;
        }
        return SemesterService.#instance;
    }*/

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
            
            if(semesterList.length > 0){
                //res.json({ table: semesterList });
                console.log('Semesterzeiten wurden erfolgreich übermittelt.');
                return semesterList;
            } else {
                return [];
            }
        } catch(err){
            console.log('Fehler beim Laden der Semesterdaten.', err);
        }
    }

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
            console.log('Fehler beim Laden der Rückmeldeinformationen.', error);
            return {};
        }
    }
}

module.exports = SemesterService;