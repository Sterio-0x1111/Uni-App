const express = require("express");
const {
  scrapeInformatikNaturwissenschaft
} = require("../../../controllers/pruefungsplaene/iserlohn/informatikNaturwissenschaftController.cjs");

const router = express.Router();

// Route für Informatik und Naturwissenschaften Prüfungspläne in Iserlohn
router.get("/informatik-naturwissenschaft", scrapeInformatikNaturwissenschaft);

module.exports = router;