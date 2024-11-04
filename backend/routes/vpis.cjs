// routes/vpis.cjs
const express = require("express");
const { loginToVPIS, getSemesters } = require("../controllers/vpisController.cjs");
const router = express.Router();

router.post("/login", loginToVPIS);
router.get("/semesters", getSemesters);

module.exports = router;