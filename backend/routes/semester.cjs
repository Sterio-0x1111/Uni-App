const express = require('express');
const router = express.Router();
const { getSemesterDates, getFeedbackDates, getDepartments } = require('../controllers/semesterController.cjs');

router.get('/dates', getSemesterDates);
router.get('/feedback', getFeedbackDates);
router.get('/departments', getDepartments);

module.exports = router;