// routes/expenses.js
const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/expenseController');

router.get('/',          auth, c.getAll);
router.post('/',         auth, c.add);
router.get('/summary',   auth, c.summary);
router.delete('/:id',    auth, c.remove);

module.exports = router;
