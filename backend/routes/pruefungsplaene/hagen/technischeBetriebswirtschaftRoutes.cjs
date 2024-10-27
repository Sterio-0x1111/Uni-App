const express = require("express");
const {
  scrapeTechnischeBetriebswirtschaft,
} = require("../../../controllers/pruefungsplaene/hagen/technischeBetriebswirtschaftController.cjs");
const router = express.Router();

router.get("/technischeBetriebswirtschaft", scrapeTechnischeBetriebswirtschaft);

module.exports = router;
