const express = require("express");
const { loginToVSC2, logoutFromVSC, getDegreesAndCourses, getExamsData } = require("../controllers/vsc/VSCController.cjs");
const router = express.Router();

router.post('/login', loginToVSC2);
router.get('/logout', logoutFromVSC);
router.get('/exams/options', getDegreesAndCourses);
router.get('/exams/:category/:degree/:course', getExamsData);

module.exports = router;