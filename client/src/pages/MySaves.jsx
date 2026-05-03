import { useEffect, useState, useCallback } from 'react';
import { getSaved, unsaveRecipe } from '../services/api';
import RecipeCard from '../components/RecipeCard';
import './MySaves.css';

export default function MySaves() {
    const [recipes, setRecipes] = useState([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);

    const fetchSaved = useCallback((q = '') => {
        setLoading(true);
        getSaved(q)
            .then(r => { setRecipes(r.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => { fetchSaved(); }, [fetchSaved]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => fetchSaved(query), 300);
        return () => clearTimeout(timer);
    }, [query, fetchSaved]);

    const handleUnsave = async (recipeId) => {
        await unsaveRecipe(recipeId);
        setRecipes(prev => prev.filter(r => r.id !== recipeId));
    };

    return (
        <div className="page">
            <div className="saves-header">
                <div>
                    <h1 className="page-title">My Saves</h1>
                    <p className="saves-sub">{recipes.length} saved {recipes.length === 1 ? 'recipe' : 'recipes'}</p>
                </div>
            </div>

            {/* Search bar */}
            <div className="saves-search card">
                <div className="search-wrap">
                    <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search your saved recipes..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="search-input"
                    />
                    {query && (
                        <button className="search-clear" onClick={() => setQuery('')}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {loading && (
                <div className="saves-skeleton">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="card skeleton-save">
                            <div className="sk-line long" />
                            <div className="sk-line medium" />
                            <div className="sk-line short" />
                        </div>
                    ))}
                </div>
            )}

            {!loading && recipes.length === 0 && (
                <div className="saves-empty card">
                    <div className="saves-empty-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                    </div>
                    <h3>{query ? 'No results found' : 'No saved recipes yet'}</h3>
                    <p>{query ? `Nothing matched "${query}"` : 'Heart a recipe on the Meals page to save it here.'}</p>
                </div>
            )}

            {!loading && recipes.length > 0 && (
                <div className="saves-grid">
                    {recipes.map(r => (
                        <div key={r.id} className="save-card card" onClick={() => setSelectedId(r.id)} style={{ cursor: 'pointer' }}>
                            {r.image_url && (
                                <div className="save-card-img-wrap">
                                    <img src={r.image_url} alt={r.title} className="save-card-img" />
                                </div>
                            )}
                            <div className="save-card-top">
                                <span className="save-mood-badge">{r.mood_tag}</span>
                                <button
                                    className="unsave-btn"
                                    onClick={e => { e.stopPropagation(); handleUnsave(r.id); }}
                                    title="Remove from saves"
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                </button>
                            </div>

                            <h3 className="save-title">{r.title}</h3>
                            <p className="save-desc">{r.description}</p>

                            <div className="save-meta">
                                <span>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="meta-icon">
                                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    {r.prep_time_minutes} min
                                </span>
                                <span>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="meta-icon">
                                        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                    </svg>
                                    PKR {r.estimated_cost}
                                </span>
                            </div>

                            {r.instructions && (
                                <details className="save-instructions">
                                    <summary>View Instructions</summary>
                                    <p>{r.instructions}</p>
                                </details>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {selectedId && (
                <RecipeCard
                    recipeId={selectedId}
                    initialSaved={true}
                    onClose={() => setSelectedId(null)}
                />
            )}
        </div>
    );
}
