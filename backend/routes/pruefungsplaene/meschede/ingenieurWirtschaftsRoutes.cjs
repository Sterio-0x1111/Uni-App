const express = require("express");
const {
  scrapeIngenieurWirtschafts,
} = require("../../../controllers/pruefungsplaene/meschede/ingenieurWirtschaftsController.cjs");
const router = express.Router();

router.get("/ingenieur-wirtschafts", scrapeIngenieurWirtschafts);

module.exports = router;