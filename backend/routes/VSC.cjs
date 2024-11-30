const express = require("express");
const { loginToVSC, loginToVSC2, logoutFromVSC, testNav, getExamResults, getExamResults2, getRegisteredExams, getReg, getExamsData } = require("../controllers/VSCController.cjs");
const router = express.Router();

router.post('/login', loginToVSC);
router.post('/login2', loginToVSC2);
router.get('/logout', logoutFromVSC);
router.get('/test', testNav);
router.get('/exams/results', getExamResults);
router.get('/exams/results2', getExamResults2);
router.get('/exams/registered/:degree/:course', getRegisteredExams);
router.get('/exams/reg', getReg);
router.get('/exams/:category/:degree/:course', getExamsData);

module.exports = router;