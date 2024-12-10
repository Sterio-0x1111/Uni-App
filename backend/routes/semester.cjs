const express = require('express');
const router = express.Router();
const { getSemesterDates, getFeedbackDates, getDepartments, getDepartmentDatesAsTable } = require('../controllers/semesterController.cjs');

router.get('/dates', getSemesterDates);
router.get('/feedback', getFeedbackDates);
router.get('/departments', getDepartments);
router.get('/departments/dates', getDepartmentDatesAsTable);

module.exports = router;