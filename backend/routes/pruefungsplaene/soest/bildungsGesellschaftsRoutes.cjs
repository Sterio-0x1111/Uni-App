const express = require("express");
const {
  scrapeBildungsGesellschafts,
} = require("../../../controllers/pruefungsplaene/soest/bildungsGesellschaftsController.cjs");

const router = express.Router();

// Route für Bildungs- und Gesellschaftswissenschaften Prüfungspläne in Soest
router.get("/bildungs-gesellschafts", scrapeBildungsGesellschafts);

module.exports = router;