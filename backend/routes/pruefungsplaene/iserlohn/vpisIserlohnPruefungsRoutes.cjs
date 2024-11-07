const express = require("express");
const {
  scrapePruefungsData
} = require("../../../controllers/pruefungsplaene/iserlohn/vpisIserlohnPruefungsController.cjs");

const router = express.Router();

// Route für Prüfungspläne in Iserlohn
router.get("/vpisIserlohnPruefungen", scrapePruefungsData);

module.exports = router;
