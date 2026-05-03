import { useState, useEffect } from 'react';
import { getRecommendations, getSavedIds, saveRecipe, unsaveRecipe } from '../services/api';
import RecipeCard from '../components/RecipeCard';
import './Recommendations.css';

export default function Recommendations() {
  const [filters, setFilters] = useState({ mood: '', max_time: '', max_cost: '', cuisine: '', difficulty: '', category: '' });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState(new Set());
  const [selectedId, setSelectedId] = useState(null);
  const [searched, setSearched] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load all recipes on mount
  useEffect(() => {
    getSavedIds().then(r => setSavedIds(new Set(r.data))).catch(() => { });
    fetchRecipes({});
  }, []);

  const fetchRecipes = async (params) => {
    setLoading(true);
    try {
      const { data } = await getRecommendations(params);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearched(true);
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '')
    );
    if (searchQuery.trim()) {
      params.q = searchQuery.trim();
    }
    fetchRecipes(params);
  };

  const handleReset = () => {
    setFilters({ mood: '', max_time: '', max_cost: '', cuisine: '', difficulty: '', category: '' });
    setSearchQuery('');
    setSearched(false);
    fetchRecipes({});
  };

  const toggleSave = async (recipeId) => {
    if (savedIds.has(recipeId)) {
      await unsaveRecipe(recipeId);
      setSavedIds(prev => { const s = new Set(prev); s.delete(recipeId); return s; });
    } else {
      await saveRecipe(recipeId);
      setSavedIds(prev => new Set(prev).add(recipeId));
    }
  };

  const matchColor = (score, total) => {
    if (!total) return 'var(--accent)';
    const pct = score / total;
    if (pct >= 0.75) return '#4A6741';
    if (pct >= 0.4) return '#84592B';
    return 'var(--accent)';
  };

  return (
    <div className="page">
      <h1 className="page-title">Meal Recommendations</h1>

      <div className="card filter-card">
        <h3>What are you in the mood for?</h3>
        
        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <input 
            type="text" 
            placeholder="Search recipes, ingredients, or keywords..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            style={{ padding: '0.8rem 1.2rem', fontSize: '1rem', borderRadius: '8px' }}
          />
        </div>

        <div className="filter-grid">
          <div className="form-group">
            <label>Mood</label>
            <select value={filters.mood} onChange={e => setFilters({ ...filters, mood: e.target.value })}>
              <option value="">Any mood</option>
              <option value="comfort">Comfort</option>
              <option value="healthy">Healthy</option>
              <option value="indulgent">Indulgent</option>
            </select>
          </div>
          <div className="form-group">
            <label>Cuisine</label>
            <select value={filters.cuisine} onChange={e => setFilters({ ...filters, cuisine: e.target.value })}>
              <option value="">Any cuisine</option>
              <option value="Pakistani">Pakistani</option>
              <option value="Indian">Indian</option>
              <option value="Continental">Continental</option>
              <option value="Chinese">Chinese</option>
              <option value="Italian">Italian</option>
              <option value="Middle Eastern">Middle Eastern</option>
            </select>
          </div>
          <div className="form-group">
            <label>Max Time (min)</label>
            <select value={filters.max_time} onChange={e => setFilters({ ...filters, max_time: e.target.value })}>
              <option value="">Any time</option>
              <option value="15">15 min</option>
              <option value="30">30 min</option>
              <option value="60">1 hour</option>
            </select>
          </div>
          <div className="form-group">
            <label>Max Budget (PKR)</label>
            <input type="number" min="1" max="15000" placeholder="e.g. 5000" value={filters.max_cost}
              onChange={e => {
                let val = e.target.value;
                if (val !== '' && Number(val) > 15000) val = '15000';
                if (val !== '' && Number(val) < 1) val = '1';
                setFilters({ ...filters, max_cost: val });
              }} />
          </div>
          <div className="form-group">
            <label>Difficulty</label>
            <select value={filters.difficulty} onChange={e => setFilters({ ...filters, difficulty: e.target.value })}>
              <option value="">Any difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div className="form-group">
            <label>Meal Category</label>
            <select value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
              <option value="">Any category</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Main Course">Main Course</option>
              <option value="Snack">Snack</option>
              <option value="Dessert">Dessert</option>
              <option value="Appetizer">Appetizer</option>
            </select>
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <label>&nbsp;</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary find-btn" onClick={handleSearch}>
                Find Meals
              </button>
              {searched && (
                <button className="btn btn-outline find-btn" onClick={handleReset}>
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="results-count">
          {searched ? `${results.length} recipes match your filters` : `Showing all ${results.length} recipes`}
        </p>
      )}

      {loading && (
        <div className="recipe-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="recipe-card card skeleton-recipe">
              <div className="sk-badge" />
              <div className="sk-line long" />
              <div className="sk-line medium" />
              <div className="sk-line short" />
            </div>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && (
        <div className="card empty-state">
          No recipes match your filters. Try relaxing them or click Reset.
        </div>
      )}

      {!loading && (
        <div className="recipe-grid">
          {results.map(r => (
            <div
              key={r.id}
              className="recipe-card card"
              onClick={() => setSelectedId(r.id)}
            >
              {r.image_url && (
                <div className="recipe-card-img-wrap">
                  <img src={r.image_url} alt={r.title} className="recipe-card-img" />
                </div>
              )}
              <div className="recipe-header">
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span className="mood-badge">{r.mood_tag}</span>
                  <span className="cuisine-badge">{r.cuisine}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {r.total_ingredients > 0 && (
                    <span className="match-badge" style={{ background: matchColor(r.match_score, r.total_ingredients) }}>
                      {r.match_score}/{r.total_ingredients}
                    </span>
                  )}
                  <button
                    className={`heart-btn ${savedIds.has(r.id) ? 'saved' : ''}`}
                    onClick={e => { e.stopPropagation(); toggleSave(r.id); }}
                    title={savedIds.has(r.id) ? 'Remove from saves' : 'Save recipe'}
                  >
                    <svg viewBox="0 0 24 24" fill={savedIds.has(r.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                </div>
              </div>

              <h3>{r.title}</h3>
              <p className="recipe-desc">{r.description}</p>

              <div className="recipe-meta">
                <span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 12, height: 12, marginRight: 3 }}>
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  {(r.prep_time_minutes || 0) + (r.cook_time_minutes || 0)} min
                </span>
                <span>PKR {r.estimated_cost}</span>
                <span className={`difficulty-tag diff-${r.difficulty?.toLowerCase()}`}>{r.difficulty}</span>
              </div>

              <div className="recipe-card-hint">Click to view full recipe</div>
            </div>
          ))}
        </div>
      )}

      {selectedId && (
        <RecipeCard
          recipeId={selectedId}
          initialSaved={savedIds.has(selectedId)}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}


