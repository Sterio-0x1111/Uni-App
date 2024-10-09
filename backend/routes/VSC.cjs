const express = require("express");
const { loginToVSC, logoutFromVSC, testNav } = require("../controllers/VSCController.cjs");
const router = express.Router();

router.post('/login', loginToVSC);
router.get('/logout', logoutFromVSC);
router.get('/test', testNav);

module.exports = router;