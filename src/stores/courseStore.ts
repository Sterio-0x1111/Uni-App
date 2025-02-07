import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from './authStore';

export const useCourseStore = defineStore('courseStore', {
    state: () => ({
        examsPage: null as any,
        degrees: [] as string[],
        bachelorCourses: [] as string[],
        masterCourses: [] as string[],
        selectedDegree: null as string | null,
        selectedCourse: null as string | null,
        authStore: useAuthStore()
    }),
    actions: {
        parseCourses(data: any, master: boolean = false): string[] {
            try {
                /*const $ = cheerio.load(data);
                const ul = $('ul.treelist').eq((master) ? 2 : 1);
                const links = $(ul).find('li a[href]').map((index, element) => $(element).attr('href')).get();
                const courses = $(ul).find('li span').map((index, element) => $(element).html().replace(/[\n\t]/g, '').trim()).get();

                // Mapping von Studiengängen und deren Links
                const mappedResults = links.map((link, index) => ({
                    name: courses[index],
                    link: link
                }));*/

                //return courses;

                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');
                const ul = doc.querySelectorAll('ul.treelist')[master ? 2 : 1];
                const links = Array.from(ul.querySelectorAll('li a[href]')).map((el) => el.getAttribute('href'));
                const courses = Array.from(ul.querySelectorAll('li span')).map((el) => 
                    el.textContent?.replace(/[\n\t]/g, '').trim() || ''
                );

                const mappedResults = links.map((link, index) => ({
                    name: courses[index],
                    link: link,
                }));

                return courses;
            } catch (error) {
                console.log('Fehler beim Laden der Studiengänge und Abschlüsse.', error);
                return [];
            }
        },
        async fetchCourses() : Promise<void> {
            try {
                if(!this.authStore.isLoggedInVSC){
                    throw new Error('Sie sind nicht eingeloggt.');
                }

                if(this.bachelorCourses.length < 1){
                    const response = await axios.get('http://localhost:3000/api/vsc/exams/reg', { withCredentials: true });
                    this.bachelorCourses = this.parseCourses(response.data.bachelorPage);
                    this.degrees = response.data.degrees;
                    this.masterCourses = (response.data.masterPage) ? this.parseCourses(response.data.masterPage) : [];
                }
            } catch(error: unknown){
                if(axios.isAxiosError(error)){
                    console.log('Fehler beim Laden der Studiengänge im Store.', error);
                } else {
                    console.log('Nicht eingeloggt.');
                    alert('Ihre Studiengänge konnten nicht geladen werden. Sie müssen sich zuerst anmelden.');
                }
                
            }
            /*if (this.bachelorCourses.length < 1) {
                try {
                    const response = await axios.get('http://localhost:3000/api/vsc/exams/reg', { withCredentials: true });
                    console.log(response.data);
                    this.bachelorCourses = this.parseCourses(response.data.bachelorPage);
                    this.degrees = response.data.degrees;
                    this.masterCourses = (response.data.masterPage) ? this.parseCourses(response.data.masterPage) : [];
                    
                } catch (error) {
                    console.log('Fehler beim Laden von Studiengängen.', error);
                }
            }*/
        }
    },
    persist: {
        storage: sessionStorage,
    }
});
