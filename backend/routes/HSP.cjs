// routes/HSPController.cjs
const express = require("express");
const { loginToHSP } = require("../controllers/HSPController.cjs");
const router = express.Router();

router.post('/login', loginToHSP);

module.exports = router;