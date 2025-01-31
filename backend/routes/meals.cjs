// routes/meals.cjs
const express = require("express");
const { getMeals, getDates } = require("../controllers/mealsController.cjs");
const router = express.Router();

router.get('/:loc', getDates);
router.get("/:mensa/:date", getMeals);

//router.get('/dates', getDates);
//router.get("/", getMeals);

module.exports = router;