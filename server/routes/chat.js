// routes/chat.js
const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { sendMessage, getHistory } = require('../controllers/chatController');

router.get('/',    auth, getHistory);
router.post('/',   auth, sendMessage);

module.exports = router;
