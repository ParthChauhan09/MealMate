const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');

router.get('/', mealController.getAllMeals);
router.get('/:id', mealController.getMealById);
router.post('/', mealController.createMeal);        // Provider only
router.put('/:id', mealController.updateMeal);      // Provider only
router.delete('/:id', mealController.deleteMeal);   // Provider only

module.exports = router;
