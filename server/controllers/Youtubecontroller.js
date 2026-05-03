const axios = require('axios');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

exports.getTrendingVideos = async (req, res) => {
    try {
        if (!YOUTUBE_API_KEY) {
            return res.status(500).json({ error: 'YouTube API key not configured' });
        }

        // Calculate date 30 days ago to ensure fresh trending content
        const lastMonth = new Date();
        lastMonth.setDate(lastMonth.getDate() - 30);

        // Search for globally viral food trends from the last 30 days
        const searchRes = await axios.get(`${BASE_URL}/search`, {
            params: {
                key: YOUTUBE_API_KEY,
                part: 'snippet',
                q: 'viral recipe | tiktok food | trending food -hindi -india',
                type: 'video',
                videoCategoryId: '26', // Howto & Style — best for recipes
                order: 'viewCount',
                regionCode: 'US', // Set to US to pull western/global TikTok viral trends
                publishedAfter: lastMonth.toISOString(),
                maxResults: 12,
                relevanceLanguage: 'en',
                safeSearch: 'strict',
            },
        });

        const videoIds = searchRes.data.items.map(item => item.id.videoId).join(',');

        // Get detailed stats (views, likes, duration) for each video
        const statsRes = await axios.get(`${BASE_URL}/videos`, {
            params: {
                key: YOUTUBE_API_KEY,
                part: 'statistics,contentDetails,snippet',
                id: videoIds,
            },
        });

        const videos = statsRes.data.items.map(video => {
            const duration = formatDuration(video.contentDetails.duration);
            const views = formatViews(video.statistics.viewCount);
            const likes = formatViews(video.statistics.likeCount);

            return {
                id: video.id,
                title: video.snippet.title,
                channel: video.snippet.channelTitle,
                thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url,
                publishedAt: video.snippet.publishedAt,
                description: video.snippet.description?.slice(0, 120) + '...',
                views,
                likes,
                duration,
                url: `https://www.youtube.com/watch?v=${video.id}`,
                embedUrl: `https://www.youtube.com/embed/${video.id}`,
            };
        });

        res.json(videos);
    } catch (err) {
        console.error('YouTube API error:', err.response?.data || err.message);
        res.status(500).json({ error: 'Failed to fetch trending videos', details: err.response?.data?.error?.message });
    }
};

function formatDuration(iso) {
    // Convert ISO 8601 duration (PT4M13S) to readable (4:13)
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '';
    const h = parseInt(match[1] || 0);
    const m = parseInt(match[2] || 0);
    const s = parseInt(match[3] || 0);
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
}

function formatViews(count) {
    if (!count) return '0';
    const n = parseInt(count);
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return String(n);
}