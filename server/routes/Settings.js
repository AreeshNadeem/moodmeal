const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/SettingsController');

router.get('/', auth, c.getProfile);
router.put('/name', auth, c.updateName);
router.put('/avatar', auth, c.updateAvatar);
router.put('/password', auth, c.updatePassword);
router.put('/preferences', auth, c.updatePreferences);
router.delete('/account', auth, c.deleteAccount);

module.exports = router;