const express = require('express');
const router = express.router;
const { getSemesterDates } = require('../controllers/semesterController.cjs');

router.get('/dates', getSemesterDates);

module.export = router;