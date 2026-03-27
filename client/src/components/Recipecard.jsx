import { useEffect, useState } from 'react';
import { getRecipe, saveRecipe, unsaveRecipe } from '../services/api';
import './RecipeCard.css';

export default function RecipeCard({ recipeId, onClose, initialSaved = false }) {
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(initialSaved);
    const [activeTab, setActiveTab] = useState('ingredients');

    useEffect(() => {
        getRecipe(recipeId)
            .then(r => { setRecipe(r.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [recipeId]);

    // Close on Escape key
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    const toggleSave = async () => {
        if (saved) {
            await unsaveRecipe(recipeId);
            setSaved(false);
        } else {
            await saveRecipe(recipeId);
            setSaved(true);
        }
    };

    const difficultyColor = { Easy: '#4A6741', Medium: '#84592B', Hard: '#8B2500' };

    return (
        <div className="rc-backdrop" onClick={onClose}>
            <div className="rc-modal" onClick={e => e.stopPropagation()}>

                {/* Close button */}
                <button className="rc-close" onClick={onClose}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>

                {loading && (
                    <div className="rc-loading">
                        <div className="rc-skeleton-img" />
                        <div className="rc-skeleton-body">
                            <div className="rc-sk-line long" />
                            <div className="rc-sk-line medium" />
                            <div className="rc-sk-line short" />
                        </div>
                    </div>
                )}

                {!loading && recipe && (
                    <>
                        {/* Image area */}
                        <div className="rc-image">
                            {recipe.image_url
                                ? <img src={recipe.image_url} alt={recipe.title} />
                                : (
                                    <div className="rc-image-placeholder">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                            <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                                            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                                            <line x1="6" y1="1" x2="6" y2="4" />
                                            <line x1="10" y1="1" x2="10" y2="4" />
                                            <line x1="14" y1="1" x2="14" y2="4" />
                                        </svg>
                                        <span>{recipe.cuisine} · {recipe.category}</span>
                                    </div>
                                )
                            }
                            {/* Badges overlaid on image */}
                            <div className="rc-image-badges">
                                <span className="rc-badge cuisine">{recipe.cuisine}</span>
                                <span className="rc-badge category">{recipe.category}</span>
                                <span className="rc-badge difficulty" style={{ background: difficultyColor[recipe.difficulty] }}>
                                    {recipe.difficulty}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="rc-body">
                            <div className="rc-header">
                                <div>
                                    <h2 className="rc-title">{recipe.title}</h2>
                                    <p className="rc-desc">{recipe.description}</p>
                                </div>
                                <button
                                    className={`rc-heart ${saved ? 'saved' : ''}`}
                                    onClick={toggleSave}
                                    title={saved ? 'Remove from saves' : 'Save recipe'}
                                >
                                    <svg viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                </button>
                            </div>

                            {/* Stats row */}
                            <div className="rc-stats">
                                <div className="rc-stat">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    <div>
                                        <span className="rc-stat-val">{recipe.prep_time_minutes + recipe.cook_time_minutes} min</span>
                                        <span className="rc-stat-lbl">Total Time</span>
                                    </div>
                                </div>
                                <div className="rc-stat">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    <div>
                                        <span className="rc-stat-val">{recipe.prep_time_minutes} min</span>
                                        <span className="rc-stat-lbl">Prep Time</span>
                                    </div>
                                </div>
                                <div className="rc-stat">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                                        <path d="M12 6v6l4 2" />
                                    </svg>
                                    <div>
                                        <span className="rc-stat-val">{recipe.cook_time_minutes} min</span>
                                        <span className="rc-stat-lbl">Cook Time</span>
                                    </div>
                                </div>
                                <div className="rc-stat">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                    <div>
                                        <span className="rc-stat-val">{recipe.servings}</span>
                                        <span className="rc-stat-lbl">Servings</span>
                                    </div>
                                </div>
                                <div className="rc-stat">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                    </svg>
                                    <div>
                                        <span className="rc-stat-val">Rs. {recipe.estimated_cost}</span>
                                        <span className="rc-stat-lbl">Est. Cost</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="rc-tabs">
                                <button className={`rc-tab ${activeTab === 'ingredients' ? 'active' : ''}`} onClick={() => setActiveTab('ingredients')}>
                                    Ingredients ({recipe.ingredients?.length || 0})
                                </button>
                                <button className={`rc-tab ${activeTab === 'steps' ? 'active' : ''}`} onClick={() => setActiveTab('steps')}>
                                    Instructions ({recipe.steps?.length || 0} steps)
                                </button>
                            </div>

                            {/* Ingredients tab */}
                            {activeTab === 'ingredients' && (
                                <div className="rc-ingredients">
                                    {recipe.ingredients?.length > 0
                                        ? recipe.ingredients.map((ing, i) => (
                                            <div key={i} className="rc-ingredient-row">
                                                <div className="rc-ingredient-dot" />
                                                <span className="rc-ingredient-name">{ing.ingredient_name}</span>
                                                <span className="rc-ingredient-qty">{ing.quantity} {ing.unit}</span>
                                            </div>
                                        ))
                                        : <p className="rc-empty">No ingredients listed.</p>
                                    }
                                </div>
                            )}

                            {/* Steps tab */}
                            {activeTab === 'steps' && (
                                <div className="rc-steps">
                                    {recipe.steps?.length > 0
                                        ? recipe.steps.map((step, i) => (
                                            <div key={i} className="rc-step">
                                                <div className="rc-step-num">{step.step_number}</div>
                                                <p className="rc-step-text">{step.instruction}</p>
                                            </div>
                                        ))
                                        : <p className="rc-empty">No instructions available.</p>
                                    }
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
