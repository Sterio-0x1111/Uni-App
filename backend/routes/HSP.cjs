// routes/HSPController.cjs
const express = require("express");
const { loginToHSP } = require("../controllers/HSPController.cjs");
const { payReport } = require("../controllers/payReportController.cjs");
const router = express.Router();

router.post('/login', loginToHSP);
router.get('/payReport', payReport);

module.exports = router;