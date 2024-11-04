// routes/hochschulportal.cjs
const express = require("express");
const { loginToHochschulportal } = require("../controllers/hochschulportalController.cjs");
const router = express.Router();

router.post("/login", loginToHochschulportal);

module.exports = router;