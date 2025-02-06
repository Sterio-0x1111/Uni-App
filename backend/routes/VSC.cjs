const express = require("express");
const { loginToVSC, loginToVSC2, logoutFromVSC, getExamResults, getExamResults2, getRegisteredExams, getDegreesAndCourses, getExamsData } = require("../controllers/VSCController.cjs");
const router = express.Router();

router.post('/login', loginToVSC);
router.post('/login2', loginToVSC2);
router.get('/logout', logoutFromVSC);
router.get('/exams/reg', getDegreesAndCourses);
router.get('/exams/:category/:degree/:course', getExamsData);

module.exports = router;