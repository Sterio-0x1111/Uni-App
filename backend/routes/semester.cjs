const express = require('express');
const router = express.Router();
const { getSemesterDates, getFeedbackDates } = require('../controllers/semesterController.cjs');

router.get('/dates', getSemesterDates);
router.get('/feedback', getFeedbackDates);

module.exports = router;