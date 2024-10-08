const express = require("express");
const { loginToVSC } = require("../controllers/VSCController.cjs");
const router = express.Router();

router.post('/login', loginToVSC);

module.exports = router;