const MealsService = require('../services/MealsService.cjs');

/**
 * Endpunkt zum Laden von Datumsinformationen für Mensapläne.
 * 
 * Der Endpunkt nutzt die Klasse MealsService 
 * und ruft die Datumsinformationen für den Standort ab 
 * der mit der Anfrage mitgeschickt wird.
 * 
 * @async 
 * @function getDates
 * 
 * @param {object} req - Anfrageobjekt, enthält Standortparameter
 * @param {object} res - Antwortobjekt, sendet Datumsinformationen als Array
 * 
 * @returns {Promise<void>} - Stattdessen wird eine JSON Antwort geschickt 
 * 
 */
const getDates = async (req, res) => {
  const location = req.params.loc.toLowerCase();
  try {
    const options = await MealsService.getDates(location);
    if (options.length > 0) {
      res.status(200).json({ options });
    } else {
      res.status(204).json({ options });
    }

  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Laden der Auswahloption.', error });
  }
}

/**
 * Endpunkt zum Laden der konkreten Mensapläne.
 * 
 * Der Endpunkt nutzt die Klasse MealsService und 
 * verwendet Standort und Datum, 
 * um den entsprechenden Mensaplan zu laden.
 * 
 * @async
 * @function getMeals
 * 
 * @param {object} req - Anfrageobjekt, enthält Standort und Datum eines Speiseplans
 * @param {object} res - Antwortobjekt, sendet konkrete eines Plans als Array
 * 
 * @returns {Promise<void>} - Stattdessen wird eine JSON Antwort gesendet, welche die Speisepläne als Array enthält
 */
const getMeals = async (req, res) => {
  const location = req.params.mensa.toLowerCase(); // Holt den Mensanamen aus der URL
  const date = req.params.date;
  const result = await MealsService.getMeals(location, date);

  (result.length > 0) ? res.status(200).json({ table: result }) : res.status(204).json({ table: result });
}

module.exports = { getMeals, getDates };