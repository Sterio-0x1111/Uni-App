const express = require('express');
const router = express.Router();
const { getSemesterDates, getFeedbackDates, getDepartments, getDepartmentDatesAsTable, getDepartmentDatesAsText, filterDepartmentTablesByLink } = require('../controllers/semesterController.cjs');

router.get('/dates', getSemesterDates);
router.get('/feedback', getFeedbackDates);
router.get('/departments', getDepartments);
//router.get('/departments/dates/:dep', getDepartmentDatesAsTable);
router.post('/departments/dates', getDepartmentDatesAsTable);
router.get('/departments/text', getDepartmentDatesAsText);
router.post('/departments/course', filterDepartmentTablesByLink);

module.exports = router;