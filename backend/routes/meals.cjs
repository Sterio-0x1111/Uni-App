// routes/meals.cjs
const express = require("express");
const { getMeals } = require("../controllers/mealsController.cjs");
const router = express.Router();

router.get("/:mensa", getMeals);

module.exports = router;