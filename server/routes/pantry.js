const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/pantryController');

router.get('/',            auth, c.getAll);
router.post('/',           auth, c.add);
router.put('/:id',         auth, c.update);
router.delete('/:id',      auth, c.remove);
router.get('/expiring',    auth, c.expiringSoon);

module.exports = router;
