const express = require("express");
const {
  scrapeMaschinenbauAutomatisierung,
} = require("../../../controllers/pruefungsplaene/soest/maschinenbauAutomatisierungController.cjs");

const router = express.Router();

// Route für Maschinenbau-Automatisierungstechnik Prüfungspläne in Soest
router.get("/maschinenbau-automatisierungstechnik", scrapeMaschinenbauAutomatisierung);

module.exports = router;