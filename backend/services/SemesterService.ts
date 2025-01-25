import { fetchHTML } from '../utils/helpers.cjs';

interface SemesterData {
    semester: string, 
    period: string
}

interface FeedbackData {
    targetArticle:  string | undefined;
    headline:       string | null;
    nextSemester:   string | null;
    nextDate:       string | null;
    infoText:       string | null;
}


export class SemesterService {
    private static instance: SemesterService | null = null;

    private constructor() {
        if (SemesterService.instance) {
            throw new Error("Singleton Klasse kann nicht erneut instanziiert werden. Verwenden Sie die .getInstance() Methode!");
        }
    }

    public static getInstance(): SemesterService {
        if (!SemesterService.instance) {
            SemesterService.instance = new SemesterService();
        }
        return SemesterService.instance;
    }
  
    public static async getSemesterDates(): Promise<SemesterData[]> {
      try {
        const url = "https://www.fh-swf.de/de/studierende/studienorganisation/vorlesungszeiten/vorlesungzeit.php";
        const $ = await fetchHTML(url);
  
        const semesterTable = $(".table").first();
        semesterTable.find("thead").remove();
  
        const semesterList: SemesterData[] = [];
  
        semesterTable.find("tr").each((_, row) => {
            const columns = $(row).find("td");
            const semester = $(columns[0]).text().trim(); // betreffendes Semester
            const period = $(columns[1]).text().trim();  // Zeiträume
  
            semesterList.push({
                semester,
                period,
            });
        });
  
        if (semesterList.length > 0) {
            console.log("Semesterzeiten wurden erfolgreich übermittelt.");
            return semesterList;
        } else {
            return [];
        }
      } catch (err) {
        console.log("Fehler beim Laden der Semesterdaten.", err);
        return [];
      }
    }
  
    public static async getFeedbackDates(): Promise<FeedbackData> {
      try {
        const url = "https://www.fh-swf.de/de/studierende/studienorganisation/vorlesungszeiten/vorlesungzeit.php";
        const $ = await fetchHTML(url);
  
        const targetArticle = $("article.wysiwyg").first().html() || undefined;
        const headline = $(targetArticle).next("h2").text().trim() || null;
        const nextSemester = $(targetArticle).next("h3").text().trim() || null;
        const nextDate = $(targetArticle).next("h4").text().trim() || null;
        const infoText = $(targetArticle).next("p").text().trim() || null;
  
        const result: FeedbackData = {
          targetArticle,
          headline,
          nextSemester,
          nextDate,
          infoText,
        };
  
        return result;
      } catch (error) {
        console.log("Fehler beim Laden der Rückmeldeinformationen.", error);
        return {
          targetArticle: undefined,
          headline: null,
          nextSemester: null,
          nextDate: null,
          infoText: null,
        };
      }
    }
  }