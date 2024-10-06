const { fetchHTML, handleError } = require("../utils/helpers.cjs");

// Mensa Plan laden
const getMeals = async (req, res) => {
  const loc = req.params.mensa.toLowerCase(); // Holt den Mensanamen aus der URL
  const url = `https://www.stwdo.de/mensa-cafes-und-catering/fh-suedwestfalen/${loc}`;

  try {
    const $ = await fetchHTML(url);
    const mealsTable = $(".meals").html();

    if (mealsTable) {
      res.json({ table: mealsTable });
    } else {
      handleError(res, "Daten nicht gesendet!");
    }
  } catch (error) {
    handleError(res, `Fehler beim Laden der Daten: ${error.message}`);
  }
};

module.exports = { getMeals };