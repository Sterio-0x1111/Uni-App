const express = require('express');
const router = express.Router();
const { getDepartments, getDepartmentDatesAsTable, getDepartmentDatesAsText, filterDepartmentTablesByLink } = require('../controllers/departmentsController.cjs');

router.get('/', getDepartments);
router.post('/dates', getDepartmentDatesAsTable);
router.get('/text', getDepartmentDatesAsText);
router.post('/course', filterDepartmentTablesByLink);

module.exports = router;