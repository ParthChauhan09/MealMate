const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

router.get('/meals/:id/reviews', reviewController.getReviewsForMeal);
router.post('/meals/:id/reviews', reviewController.addReview);
router.put('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);

module.exports = router;
