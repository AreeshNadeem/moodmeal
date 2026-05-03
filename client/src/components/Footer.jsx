import { Link } from 'react-router-dom';
import logoMouse from '../assets/logo-mouse.png';
import './Footer.css';

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-inner">

                {/* Brand col */}
                <div className="footer-brand-col">
                    <span className="footer-logo" style={{ display: 'flex', alignItems: 'center' }}>
                        <img src={logoMouse} alt="Logo" style={{ height: '39px', marginRight: '10px' }} />
                        MoodMeal
                    </span>
                    <p className="footer-tagline">
                        Smart meal decisions powered by your pantry, mood, and budget.
                    </p>
                    <div className="footer-socials">
                        {/* Instagram */}
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                <circle cx="12" cy="12" r="4" />
                                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                            </svg>
                        </a>
                        {/* LinkedIn */}
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                                <rect x="2" y="9" width="4" height="12" />
                                <circle cx="4" cy="4" r="2" />
                            </svg>
                        </a>
                        {/* X / Twitter */}
                        <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="X">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </a>
                        {/* GitHub */}
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="GitHub">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Features col */}
                <div className="footer-col">
                    <h4>Features</h4>
                    <ul>
                        <li><Link to="/pantry">Pantry Manager</Link></li>
                        <li><Link to="/recommendations">Meal Recommendations</Link></li>
                        <li><Link to="/expenses">Expense Tracker</Link></li>
                        <li><Link to="/trending">Trending Recipes</Link></li>
                        <li><Link to="/chat">AI Assistant</Link></li>
                        <li><Link to="/saves">My Saves</Link></li>
                    </ul>
                </div>

                {/* About col */}
                <div className="footer-col">
                    <h4>About Us</h4>
                    <ul>
                        <li><a href="#about">Our Story</a></li>
                        <li><a href="#team">The Team</a></li>
                        <li><a href="#mission">Our Mission</a></li>
                        <li><a href="#blog">Blog</a></li>
                        <li><a href="#press">Press</a></li>
                    </ul>
                </div>

                {/* Contact col */}
                <div className="footer-col">
                    <h4>Contact Us</h4>
                    <ul>
                        <li><a href="mailto:support@moodmeal.app">support@moodmeal.app</a></li>
                        <li><a href="#help">Help Center</a></li>
                        <li><Link to="/settings">Settings</Link></li>
                        <li><a href="#privacy">Privacy Policy</a></li>
                        <li><a href="#terms">Terms of Service</a></li>
                    </ul>
                </div>

            </div>

            <div className="footer-bottom">
                <span>© {year} MoodMeal. All rights reserved.</span>
                <span>Made with care by Areesh, Fizza & Safa</span>
            </div>
        </footer>
    );
}
