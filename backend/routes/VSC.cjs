const express = require("express");
const { loginToVSC, logoutFromVSC, testNav, getExamResults, getRegisteredExams, getReg } = require("../controllers/VSCController.cjs");
const router = express.Router();

router.post('/login', loginToVSC);
router.get('/logout', logoutFromVSC);
router.get('/test', testNav);
router.get('/exams/results', getExamResults);
router.get('/exams/registered/:degree/:course', getRegisteredExams);
router.get('/exams/reg', getReg);

module.exports = router;