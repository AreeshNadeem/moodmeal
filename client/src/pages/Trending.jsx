import { useEffect, useState } from 'react';
import { getTrendingVideos } from '../services/api';
import './Trending.css';

export default function Trending() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeVideo, setActive] = useState(null);

  useEffect(() => {
    getTrendingVideos()
      .then(r => { setVideos(r.data); setLoading(false); })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to load videos');
        setLoading(false);
      });
  }, []);

  const timeAgo = (dateStr) => {
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 3600) return Math.floor(diff / 60) + ' mins ago';
    if (diff < 86400) return Math.floor(diff / 3600) + ' hrs ago';
    if (diff < 2592000) return Math.floor(diff / 86400) + ' days ago';
    return Math.floor(diff / 2592000) + ' months ago';
  };

  return (
    <div className="page">
      <div className="trending-header">
        <div>
          <h1 className="page-title">Trending Now</h1>
          <p className="trending-sub">Most-watched food &amp; recipe videos right now</p>
        </div>
      </div>

      {loading && (
        <div className="trending-loading">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton-card card">
              <div className="skeleton-thumb" />
              <div className="skeleton-body">
                <div className="skeleton-line long" />
                <div className="skeleton-line short" />
                <div className="skeleton-line medium" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="trending-error card">
          <h3>Could not load videos</h3>
          <p>{error}</p>
          <p className="error-hint">Make sure <strong>YOUTUBE_API_KEY</strong> is set in your server <code>.env</code> file.</p>
        </div>
      )}

      {!loading && !error && (
        <div className="video-grid">
          {videos.map(video => (
            <div key={video.id} className="video-card card">
              {/* Thumbnail */}
              <div className="thumb-wrap" onClick={() => setActive(video)}>
                <img src={video.thumbnail} alt={video.title} className="thumb-img" />
                <div className="thumb-overlay">
                  <div className="play-btn">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                <span className="duration-badge">{video.duration}</span>
              </div>

              {/* Info */}
              <div className="video-info">
                <h3 className="video-title" onClick={() => setActive(video)}>
                  {video.title}
                </h3>
                <p className="video-channel">{video.channel}</p>
                <div className="video-meta">
                  <span>{video.views} views</span>
                  <span className="meta-dot">·</span>
                  <span>{timeAgo(video.publishedAt)}</span>
                </div>
                <div className="video-actions">
                  <button className="btn btn-primary video-watch-btn" onClick={() => setActive(video)}>
                    Watch
                  </button>
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline video-yt-btn"
                  >
                    Open in YouTube
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Modal */}
      {activeVideo && (
        <div className="modal-backdrop" onClick={() => setActive(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{activeVideo.title}</h3>
              <button className="modal-close" onClick={() => setActive(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-embed">
              <iframe
                src={`${activeVideo.embedUrl}?autoplay=1&rel=0`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="modal-footer">
              <div className="modal-stats">
                <span>{activeVideo.views} views</span>
                <span className="meta-dot">·</span>
                <span>{activeVideo.likes} likes</span>
                <span className="meta-dot">·</span>
                <span>{activeVideo.channel}</span>
              </div>
              <a
                href={activeVideo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                Open in YouTube
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

