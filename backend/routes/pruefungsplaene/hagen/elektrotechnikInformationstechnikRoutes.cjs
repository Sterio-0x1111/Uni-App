const express = require("express");
const {
  scrapeElektrotechnikInformationstechnik,
} = require("../../../controllers/pruefungsplaene/hagen/elektrotechnikInformationstechnikController.cjs");
const router = express.Router();

router.get(
  "/elektrotechnikInformationstechnik",
  scrapeElektrotechnikInformationstechnik
);

module.exports = router;