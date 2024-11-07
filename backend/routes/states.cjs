const { getLoginStates } = require('../controllers/statesController.cjs');
const express = require('express');
const router = express.Router();

router.get('/states', getLoginStates);

module.exports = router;