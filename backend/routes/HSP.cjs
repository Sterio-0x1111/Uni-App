// routes/HSPController.cjs
const express = require("express");
const { loginToHSP, logoutFromHSP } = require("../controllers/hsp/HSPController.cjs");
const { scrapePayments, payReport } = require("../controllers/hsp/payReportController.cjs");
const { scrapeMyS } = require("../controllers/hsp/PersonalInformationController.cjs");
const router = express.Router();

router.post('/login', loginToHSP);
router.get("/logout", logoutFromHSP);
router.get("/scrapeMyS", scrapeMyS);
router.get("/scrapePayments", scrapePayments);
router.get("/payReport", payReport);

module.exports = router;