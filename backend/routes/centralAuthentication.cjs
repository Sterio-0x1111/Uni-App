const express = require("express");
const router = express.Router();
const { centralLogin, centralLogout } = require("../controllers/centralAuthenticationController.cjs");

router.post('/login', centralLogin);
router.post('/logout', centralLogout);

module.exports = router;