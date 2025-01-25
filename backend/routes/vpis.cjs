// routes/vpis.cjs
const express = require("express");
const { loginToVPIS, logoutToVPIS, getSemesters } = require("../controllers/vpis/vpisController.cjs");
const router = express.Router();

router.post("/login", loginToVPIS);
router.get("/logout", logoutToVPIS);
router.get("/semesters", getSemesters);

module.exports = router;