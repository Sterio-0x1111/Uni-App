const { fetchHTML, handleError } = require("../utils/helpers.cjs");
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Laden der Daten, für die ein Mensaplan verfügbar ist.
 */
const getDates = async (req, res) => {
  try {
    console.log('OPTIONS CALLED');
    const location = req.params.loc.toLowerCase();
    const url = `https://www.stwdo.de/mensa-cafes-und-catering/fh-suedwestfalen/${location}`;
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

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
      res.json({ options: dateSelection });
      console.log('Successfully sent date selection options.');
    } else {
      res.status(500).json({ error: 'Failed to send date selection options.' });
    }

  } catch (error) {
    console.error('Error while providing selection options.', error);
  }
}

// route: '/api/mensa/options/:loc'

/**
 * 
 * Endpujnkt zum Laden der Mensapläne.
 * 
 * Dieser Endpunkt wird vom Frontend aufgerufen 
 * und gibt hierbei einen Standort als URL Parameter mit.
 * Der entsprechende Plan wird geladen, geparst und aufbereitet 
 * und danach als JSON Format an das Frontend gesendet.
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

    $('.meals tbody tr').each((index, element) => {
      //const categoryIcon = $(element).find('.meals__icon-category').attr('alt');
      const title = $(element).find('.meals__title').text().trim();
      const priceStudent = $(element).find('td:nth-child(4)').text().trim();
      const priceEmployee = $(element).find('td:nth-child(5)').text().trim();
      const priceGuest = $(element).find('td:nth-child(6)').text().trim();

      mealsTable.push({
        //categoryIcon,
        title,
        priceStudent,
        priceEmployee,
        priceGuest
      })
    })

    if (mealsTable.length > 0) {
      res.json({ table: mealsTable });
      console.log('Successfully send response!');
    } else {
      res.status(500).json({ err: 'Fehler! Daten wurden nicht gesendet!' });
      console.log('Daten nicht gesendet!');
    }
  } catch (err) {
    console.log('Fehler beim Laden der Daten.', err);
  }
}

// route: '/api/meals/:mensa/:date'

module.exports = { getMeals, getDates };