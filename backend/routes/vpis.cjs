// routes/vpis.cjs
const express = require("express");
const { loginToVPIS, logoutFromVPIS, getSemesters } = require("../controllers/vpis/VPISController.cjs");
const router = express.Router();

router.post("/login", loginToVPIS);
router.get("/logout", logoutFromVPIS);
router.get("/semesters", getSemesters);

module.exports = router;