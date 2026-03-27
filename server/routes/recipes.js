// routes/recipes.js
const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/recipeController');

router.get('/recommend', auth, c.recommend);
router.get('/trending', auth, c.trending);
router.get('/all', auth, c.getAll);
router.get('/:id', auth, c.getOne);

module.exports = router;