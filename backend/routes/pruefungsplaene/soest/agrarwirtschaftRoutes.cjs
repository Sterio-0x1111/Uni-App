const express = require("express");
const {
  scrapeAgrarwirtschaft,
} = require("../../../controllers/pruefungsplaene/soest/agrarwirtschaftController.cjs");

const router = express.Router();

// Route für das Abrufen der Prüfungspläne der Agrarwirtschaft in Soest
router.get("/agrarwirtschaft", scrapeAgrarwirtschaft);

module.exports = router;