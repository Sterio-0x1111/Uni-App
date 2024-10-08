const express = require('express');
const router = express.Router();
const { getSemesterDates } = require('../controllers/semesterController.cjs');

router.get('/dates', getSemesterDates);

module.exports = router;