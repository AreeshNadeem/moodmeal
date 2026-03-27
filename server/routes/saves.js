const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { getSaved, save, unsave, getSavedIds } = require('../controllers/SavesController');

router.get('/', auth, getSaved);
router.get('/ids', auth, getSavedIds);
router.post('/', auth, save);
router.delete('/:recipe_id', auth, unsave);

module.exports = router;