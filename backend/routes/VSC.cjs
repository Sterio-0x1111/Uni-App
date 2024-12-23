const express = require("express");
const { loginToVSC, logoutFromVSC, testNav, getExamResults, getRegisteredExams } = require("../controllers/VSCController.cjs");
const router = express.Router();

router.post('/login', loginToVSC);
router.get('/logout', logoutFromVSC);
router.get('/test', testNav);
router.get('/exams/results', getExamResults);
router.get('/exams/registered', getRegisteredExams);

module.exports = router;