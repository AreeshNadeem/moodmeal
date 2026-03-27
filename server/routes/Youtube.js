const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { getTrendingVideos } = require('../controllers/Youtubecontroller');

router.get('/', auth, getTrendingVideos);

module.exports = router;