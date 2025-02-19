const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Die Klasse enthält statische Methoden zum Laden von Mensa- und Speiseinformationen.
 * 
 * @author Emre Burak Koc
 */

class MealsService {
 
    /**
     * Methode zum Laden der Datumsinformationen für Menüs.
     * 
     * Die Methode lädt die für einen Standort verfügbaren Daten.
     * 
     * @async 
     * @function getDates
     * 
     * @param {*} loc - Standort, für den die Daten geladen werden
     * @returns {Promise<any[]>} dateSelection - Die verfügbaren Daten für einen Mensastandort
     */
    static async getDates(loc) {
        try {
            const url = `https://www.stwdo.de/mensa-cafes-und-catering/fh-suedwestfalen/${loc}`;

            const response = await axios.get(url);
            const html = response.data;
            const $ = cheerio.load(html);

            // filtert die auswählbaren Optionen der Selection Box
            const dateSelection = [];
            $('select').find('option').each((index, opt) => {
                const optionText = $(opt).text().trim();
                const optionValue = $(opt).attr('value');

                dateSelection.push({
                    optionText,
                    optionValue
                });
            });

            return dateSelection;

        } catch (error) {
            console.error('Error while providing selection options.', error);
            throw new Error(error);
        }
    }

    /**
     * Methode zum Laden der Speisepläne.
     * 
     * Die Methode lädt die für einen Standort 
     * an einem bestimmten Datum verfügbaren Speisepläne.
     * 
     * @async
     * @function getMeals
     * 
     * @param {string} location - Standort, für den die Speisepläne geladen werden
     * @param {string} date - Datum, an dem die zu ladenden Speisepläne verfügbar sind
     * 
     * @returns {Promise<any[]>} mealsTable - die geladenen Speisepläne
     */
    static async getMeals(location, date) {
        try {
            const url = `https://www.stwdo.de/mensa-cafes-und-catering/fh-suedwestfalen/${location}/${date}`;

            const response = await axios.get(url);
            const html = response.data;
            const $ = cheerio.load(html);

            //const mealsTable = $('.meals tbody').html();
            const mealsTable = [];

            // filtert die Tabelle mit den Menüs und Preisen
            $('.meals tbody tr').each((index, element) => {
                const categoryIcon = $(element).find('.meals__icon-category').attr('alt');
                const supplyIcon = $(element).find('.meals__icon-supply').attr('alt');
                const title = $(element).find('.meals__title').text().trim();
                const priceStudent = $(element).find('td:nth-child(4)').text().trim();
                const priceEmployee = $(element).find('td:nth-child(5)').text().trim();
                const priceGuest = $(element).find('td:nth-child(6)').text().trim();

                mealsTable.push({
                    categoryIcon,
                    supplyIcon,
                    title,
                    priceStudent,
                    priceEmployee,
                    priceGuest
                })
            })

            mealsTable.forEach((meal, index) => {
                if (!meal.title && !meal.priceStudent) {
                    mealsTable[index].title = 'Beiwerke';
                }
            })

            return mealsTable;
        } catch (err) {
            console.error('Fehler beim Laden der Daten.', err);
        }
    }
}

module.exports = MealsService;