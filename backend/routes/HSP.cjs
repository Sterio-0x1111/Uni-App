// routes/HSPController.cjs
const express = require("express");
const { loginToHSP, logoutFromHSP } = require("../controllers/hsp/HSPController.cjs");
const { scrapeMyS, scrapePayments, payReport } = require("../controllers/hsp/payReportController.cjs");
const router = express.Router();

router.post('/login', loginToHSP);
router.get("/scrapeMyS", scrapeMyS);
router.get("/scrapePayments", scrapePayments);
router.get("/payReport", payReport);
router.get("/logout", logoutFromHSP);

module.exports = router;