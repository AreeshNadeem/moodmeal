import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getExpiring, getExpenseSummary, getRecommendations, getAllRecipes, getSavedIds, saveRecipe, unsaveRecipe } from '../services/api';
import './Home.css';

export default function Home() {
  const { user } = useAuth();
  const [expiring, setExpiring] = useState([]);
  const [summary, setSummary] = useState([]);
  const [meals, setMeals] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());

  useEffect(() => {
    getExpiring(3).then(r => setExpiring(r.data)).catch(() => { });
    getExpenseSummary().then(r => setSummary(r.data)).catch(() => { });
    getAllRecipes({}).then(r => {
      const featured = ['Chicken Sandwich', 'Apple Smoothie', 'Chicken Parmesan'];
      const picked = featured.map(name => r.data.find(m => m.title === name)).filter(Boolean);
      setMeals(picked);
    }).catch(() => { });
    getSavedIds().then(r => setSavedIds(new Set(r.data))).catch(() => { });
  }, []);

  const toggleSave = async (recipeId) => {
    if (savedIds.has(recipeId)) {
      await unsaveRecipe(recipeId);
      setSavedIds(prev => { const s = new Set(prev); s.delete(recipeId); return s; });
    } else {
      await saveRecipe(recipeId);
      setSavedIds(prev => new Set(prev).add(recipeId));
    }
  };

  const totalSpend = summary.reduce((s, r) => s + Number(r.total), 0);

  const quickLinks = [
    { to: '/pantry', label: 'Pantry', desc: 'Manage your ingredients' },
    { to: '/recommendations', label: 'Get Meals', desc: 'Smart suggestions for you' },
    { to: '/expenses', label: 'Expenses', desc: 'Track food spending' },
    { to: '/trending', label: 'Trending', desc: 'Discover new recipes' },
    { to: '/chat', label: 'Assistant', desc: 'Your AI cooking assistant' },
  ];

  return (
    <div className="page">
      <div className="home-hero card">
        <h2>Ready to Cook, {user?.name?.split(' ')[0]}?</h2>
        <p>What would you like to do today?</p>
        <Link to="/recommendations" className="btn btn-primary">Get Meal Suggestions</Link>
      </div>

      {expiring.length > 0 && (
        <div className="expiry-alert card">
          <h3>Expiring Soon</h3>
          <ul>
            {expiring.map(item => (
              <li key={item.id}>
                <strong>{item.name}</strong> — {item.quantity} {item.unit} — expires {item.expiry_date?.split('T')[0]}
              </li>
            ))}
          </ul>
          <Link to="/recommendations?prioritize=expiry" className="btn btn-outline" style={{ marginTop: '0.75rem' }}>
            Find recipes using these
          </Link>
        </div>
      )}

      <div className="home-stats">
        <div className="stat-card card">
          <div className="stat-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <div className="stat-value">Rs. {totalSpend.toLocaleString()}</div>
            <div className="stat-label">Spent this month</div>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div>
            <div className="stat-value">{expiring.length}</div>
            <div className="stat-label">Items expiring soon</div>
          </div>
        </div>
      </div>

      <div className="quick-links">
        {quickLinks.map(l => (
          <Link key={l.to} to={l.to} className="quick-card card">
            <strong>{l.label}</strong>
            <span>{l.desc}</span>
          </Link>
        ))}
      </div>

      {/* Meals For You */}
      {meals.length > 0 && (
        <div className="meals-section">
          <div className="meals-section-header">
            <h2>Meals For You</h2>
            <Link to="/recommendations" className="explore-link">
              Explore Meals
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 8 16 12 12 16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </Link>
          </div>
          <div className="meals-grid">
            {meals.map(meal => (
              <div key={meal.id} className="meal-card card">
                <div className="meal-img-wrap">
                  {meal.image_url ? (
                    <img
                      src={meal.image_url}
                      alt={meal.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="meal-img-placeholder" style={{ display: meal.image_url ? 'none' : 'flex' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                      <line x1="6" y1="1" x2="6" y2="4" />
                      <line x1="10" y1="1" x2="10" y2="4" />
                      <line x1="14" y1="1" x2="14" y2="4" />
                    </svg>
                  </div>
                </div>

                <div className="meal-info">
                  <div className="meal-title-row">
                    <h3>{meal.title}</h3>
                    <button
                      className={`heart-btn ${savedIds.has(meal.id) ? 'saved' : ''}`}
                      onClick={() => toggleSave(meal.id)}
                    >
                      <svg viewBox="0 0 24 24" fill={savedIds.has(meal.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>
                  <div className="meal-bottom">
                    <Link to={`/recommendations`} className="meal-btn">Find Recipe</Link>
                    <span className="meal-time">{meal.prep_time_minutes} min</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
