const express = require("express");
const {
  scrapeElektrotechnikInformationstechnik,
} = require("../../../controllers/pruefungsplaene/hagen/elektrotechnikInformationstechnikController.cjs");
const router = express.Router();

router.get("/elektrotechnik-informationstechnik", scrapeElektrotechnikInformationstechnik);

module.exports = router;