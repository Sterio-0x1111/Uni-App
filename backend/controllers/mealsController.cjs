const { fetchHTML, handleError } = require("../utils/helpers.cjs");
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Laden der Daten, für die ein Mensaplan verfügbar ist.
 * 
 * Die Funktion nimmt einen Standort als Parameter 
 * und ermittelt die für diesen Standort verfügbaren Datumsoptionen,
 * an denen ein Mensaplan abrufbar ist.
 * 
 * @param loc
 *  Ausgewählter Standort
 */
const getDates = async (req, res) => {
  try {
    const location = req.params.loc.toLowerCase();
    const url = `https://www.stwdo.de/mensa-cafes-und-catering/fh-suedwestfalen/${location}`;

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

    if (dateSelection.length > 0) {
      res.status(200).json({ options: dateSelection });
      console.log('Successfully sent date selection options.');
    } else {
      res.status(204).json({ message: 'Keine Mensapläne gefunden.' });
    }

  } catch (error) {
    console.error('Error while providing selection options.', error);
    res.status(500).json({ error: 'Failed to send date selection options.' });
  }
}

/**
 * Endpunkt zum Laden der Mensapläne.
 * 
 * Dieser Endpunkt wird vom Frontend aufgerufen 
 * und gibt hierbei einen Standort als URL Parameter mit.
 * Der entsprechende Plan wird geladen, geparst und aufbereitet 
 * und danach als JSON Format an das Frontend gesendet.
 * 
 * @param mensa
 *  Der Standort. für den ein Plan geladen werden soll.
 * @param date
 *  Das Datum des zu ladenden Mensaplans.
 */
const getMeals = async (req, res) => {
  try {
    const location = req.params.mensa.toLowerCase(); // Holt den Mensanamen aus der URL
    const date = req.params.date;
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
      if(!meal.title && !meal.priceStudent){
        mealsTable[index].title = 'Beiwerke';
      }
    })

    if (mealsTable.length > 0) {
      res.status(200).json({ table: mealsTable });
      console.log('Successfully send response!');
    } else {
      res.status(204).json({ message: 'Keine Informationen über den Speiseplan gefunden.' });
      console.log('Daten nicht gesendet!');
    }
  } catch (err) {
    res.status(500).json({ err: 'Fehler! Daten wurden nicht gesendet!' });
    console.log('Fehler beim Laden der Daten.', err);
  }
}

module.exports = { getMeals, getDates };