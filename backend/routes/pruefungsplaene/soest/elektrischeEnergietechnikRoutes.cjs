const express = require("express");
const {
  scrapeElektrischeEnergietechnik,
} = require("../../../controllers/pruefungsplaene/soest/elektrischeEnergietechnikController.cjs");

const router = express.Router();

// Route für Elektrische Energietechnik Prüfungspläne in Soest
router.get("/elektrische-energietechnik", scrapeElektrischeEnergietechnik);

module.exports = router;