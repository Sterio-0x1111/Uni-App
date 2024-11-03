const express = require("express");
const {
  scrapeMaschinenbau
} = require("../../../controllers/pruefungsplaene/iserlohn/maschinenbauController.cjs");

const router = express.Router();

// Route für Maschinenbau Prüfungspläne in Iserlohn
router.get("/maschinenbau", scrapeMaschinenbau);

module.exports = router;