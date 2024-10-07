const express = require("express");
const { scrapePlaner } = require("../controllers/vpisPlanerController.cjs");
const router = express.Router();

router.get("/planer", scrapePlaner);

module.exports = router;