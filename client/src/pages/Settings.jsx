import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    getProfile, updateName, updateAvatar,
    updatePassword, updatePreferences, deleteAccount
} from '../services/api';
import './Settings.css';

const SECTIONS = [
    { id: 'profile', label: 'Profile' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'dietary', label: 'Dietary & Budget' },
    { id: 'security', label: 'Security' },
    { id: 'help', label: 'Help & Support' },
    { id: 'danger', label: 'Danger Zone' },
];

function Toast({ msg, type, onDone }) {
    useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
    return <div className={`settings-toast ${type}`}>{msg}</div>;
}

export default function Settings() {
    const { user, login, logout } = useAuth();
    const navigate = useNavigate();
    const fileRef = useRef();

    const [active, setActive] = useState('profile');
    const [profile, setProfile] = useState(null);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);

    // Form states
    const [name, setName] = useState('');
    const [avatarPreview, setAvatarPrev] = useState(null);
    const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' });
    const [prefs, setPrefs] = useState({
        notifications_expiry: 1,
        notifications_budget: 1,
        notifications_trending: 0,
        dietary_mode: 'none',
        weekly_budget: '',
        currency: 'PKR',
        language: 'en',
    });
    const [deletePass, setDeletePass] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState('');

    const showToast = (msg, type = 'success') => setToast({ msg, type });

    useEffect(() => {
        getProfile()
            .then(r => {
                setProfile(r.data);
                setName(r.data.name);
                setAvatarPrev(r.data.avatar_url || null);
                if (r.data.preferences) {
                    setPrefs(prev => ({ ...prev, ...r.data.preferences }));
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // Avatar: convert file to base64
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { showToast('Image must be under 2MB', 'error'); return; }
        const reader = new FileReader();
        reader.onload = () => setAvatarPrev(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSaveProfile = async () => {
        try {
            await updateName({ name });
            if (avatarPreview !== profile?.avatar_url) {
                await updateAvatar({ avatar_url: avatarPreview });
            }
            // Update auth context name
            login({ ...user, name }, localStorage.getItem('mm_token'));
            showToast('Profile updated successfully');
        } catch (err) {
            showToast(err.response?.data?.error || 'Failed to update profile', 'error');
        }
    };

    const handleSavePassword = async () => {
        if (pwForm.new_password !== pwForm.confirm) {
            showToast('New passwords do not match', 'error'); return;
        }
        try {
            await updatePassword({ current_password: pwForm.current_password, new_password: pwForm.new_password });
            setPwForm({ current_password: '', new_password: '', confirm: '' });
            showToast('Password changed successfully');
        } catch (err) {
            showToast(err.response?.data?.error || 'Failed to update password', 'error');
        }
    };

    const handleSavePrefs = async () => {
        try {
            await updatePreferences(prefs);
            showToast('Preferences saved');
        } catch (err) {
            showToast('Failed to save preferences', 'error');
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirm !== 'DELETE') {
            showToast('Type DELETE to confirm', 'error'); return;
        }
        try {
            await deleteAccount({ password: deletePass });
            logout();
            navigate('/login');
        } catch (err) {
            showToast(err.response?.data?.error || 'Failed to delete account', 'error');
        }
    };

    const Toggle = ({ value, onChange }) => (
        <button className={`toggle ${value ? 'on' : 'off'}`} onClick={() => onChange(!value)}>
            <span className="toggle-thumb" />
        </button>
    );

    if (loading) return <div className="page settings-loading">Loading settings...</div>;

    return (
        <div className="page settings-page">
            {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

            <h1 className="page-title">Settings</h1>

            <div className="settings-layout">
                {/* Sidebar */}
                <aside className="settings-sidebar card">
                    <div className="sidebar-avatar-wrap">
                        <div className="sidebar-avatar">
                            {avatarPreview
                                ? <img src={avatarPreview} alt="avatar" />
                                : <span>{user?.name?.charAt(0).toUpperCase()}</span>
                            }
                        </div>
                        <div>
                            <strong className="sidebar-name">{user?.name}</strong>
                            <span className="sidebar-email">{user?.email}</span>
                        </div>
                    </div>
                    <nav className="settings-nav">
                        {SECTIONS.map(s => (
                            <button
                                key={s.id}
                                className={`settings-nav-item ${active === s.id ? 'active' : ''} ${s.id === 'danger' ? 'danger' : ''}`}
                                onClick={() => setActive(s.id)}
                            >
                                {s.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Content */}
                <div className="settings-content">

                    {/* PROFILE */}
                    {active === 'profile' && (
                        <div className="settings-section card">
                            <h2>Profile</h2>
                            <p className="section-desc">Update your name and profile picture.</p>

                            {/* Avatar upload */}
                            <div className="avatar-upload">
                                <div className="avatar-preview">
                                    {avatarPreview
                                        ? <img src={avatarPreview} alt="avatar" />
                                        : <span>{user?.name?.charAt(0).toUpperCase()}</span>
                                    }
                                </div>
                                <div className="avatar-actions">
                                    <button className="btn btn-outline" onClick={() => fileRef.current.click()}>
                                        Upload Photo
                                    </button>
                                    {avatarPreview && (
                                        <button className="btn btn-danger" onClick={() => setAvatarPrev(null)}>
                                            Remove
                                        </button>
                                    )}
                                    <p className="avatar-hint">JPG or PNG, max 2MB</p>
                                </div>
                                <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
                            </div>

                            <div className="form-group" style={{ maxWidth: 400 }}>
                                <label>Display Name</label>
                                <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
                            </div>
                            <div className="form-group" style={{ maxWidth: 400 }}>
                                <label>Email Address</label>
                                <input value={profile?.email || ''} disabled className="input-disabled" />
                                <span className="field-hint">Email cannot be changed</span>
                            </div>
                            <div className="form-group" style={{ maxWidth: 400 }}>
                                <label>Member Since</label>
                                <input value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) : ''} disabled className="input-disabled" />
                            </div>
                            <button className="btn btn-primary" onClick={handleSaveProfile}>Save Profile</button>
                        </div>
                    )}

                    {/* NOTIFICATIONS */}
                    {active === 'notifications' && (
                        <div className="settings-section card">
                            <h2>Notifications</h2>
                            <p className="section-desc">Choose what alerts you want to receive.</p>

                            <div className="pref-list">
                                <div className="pref-row">
                                    <div>
                                        <strong>Expiry Alerts</strong>
                                        <p>Get notified when pantry items are expiring within 3 days</p>
                                    </div>
                                    <Toggle value={!!prefs.notifications_expiry} onChange={v => setPrefs({ ...prefs, notifications_expiry: v ? 1 : 0 })} />
                                </div>
                                <div className="pref-row">
                                    <div>
                                        <strong>Budget Warnings</strong>
                                        <p>Alert when your weekly food spending approaches your limit</p>
                                    </div>
                                    <Toggle value={!!prefs.notifications_budget} onChange={v => setPrefs({ ...prefs, notifications_budget: v ? 1 : 0 })} />
                                </div>
                                <div className="pref-row">
                                    <div>
                                        <strong>Trending Recipes</strong>
                                        <p>Weekly digest of the most popular recipes right now</p>
                                    </div>
                                    <Toggle value={!!prefs.notifications_trending} onChange={v => setPrefs({ ...prefs, notifications_trending: v ? 1 : 0 })} />
                                </div>
                            </div>
                            <button className="btn btn-primary" onClick={handleSavePrefs}>Save Preferences</button>
                        </div>
                    )}

                    {/* DIETARY & BUDGET */}
                    {active === 'dietary' && (
                        <div className="settings-section card">
                            <h2>Dietary & Budget</h2>
                            <p className="section-desc">Set your dietary preferences and spending limits.</p>

                            <div className="form-group" style={{ maxWidth: 320 }}>
                                <label>Dietary Mode</label>
                                <select value={prefs.dietary_mode} onChange={e => setPrefs({ ...prefs, dietary_mode: e.target.value })}>
                                    <option value="none">No restriction</option>
                                    <option value="vegetarian">Vegetarian</option>
                                    <option value="vegan">Vegan</option>
                                    <option value="halal">Halal</option>
                                    <option value="gluten-free">Gluten-Free</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ maxWidth: 320 }}>
                                <label>Weekly Food Budget</label>
                                <input type="number" min="0" placeholder="e.g. 3000"
                                    value={prefs.weekly_budget}
                                    onChange={e => setPrefs({ ...prefs, weekly_budget: e.target.value })} />
                            </div>
                            <div className="form-group" style={{ maxWidth: 320 }}>
                                <label>Currency</label>
                                <select value={prefs.currency} onChange={e => setPrefs({ ...prefs, currency: e.target.value })}>
                                    <option value="PKR">PKR — Pakistani Rupee</option>
                                    <option value="USD">USD — US Dollar</option>
                                    <option value="GBP">GBP — British Pound</option>
                                    <option value="SAR">SAR — Saudi Riyal</option>
                                    <option value="AED">AED — UAE Dirham</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ maxWidth: 320 }}>
                                <label>Language</label>
                                <select value={prefs.language} onChange={e => setPrefs({ ...prefs, language: e.target.value })}>
                                    <option value="en">English</option>
                                    <option value="ur">Urdu</option>
                                </select>
                            </div>
                            <button className="btn btn-primary" onClick={handleSavePrefs}>Save Preferences</button>
                        </div>
                    )}

                    {/* SECURITY */}
                    {active === 'security' && (
                        <div className="settings-section card">
                            <h2>Security</h2>
                            <p className="section-desc">Change your password to keep your account safe.</p>

                            <div style={{ maxWidth: 380 }}>
                                <div className="form-group">
                                    <label>Current Password</label>
                                    <input type="password" placeholder="••••••••"
                                        value={pwForm.current_password}
                                        onChange={e => setPwForm({ ...pwForm, current_password: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>New Password</label>
                                    <input type="password" placeholder="Min 6 characters"
                                        value={pwForm.new_password}
                                        onChange={e => setPwForm({ ...pwForm, new_password: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Confirm New Password</label>
                                    <input type="password" placeholder="Repeat new password"
                                        value={pwForm.confirm}
                                        onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} />
                                </div>
                                <button className="btn btn-primary" onClick={handleSavePassword}>Update Password</button>
                            </div>
                        </div>
                    )}

                    {/* HELP & SUPPORT */}
                    {active === 'help' && (
                        <div className="settings-section card">
                            <h2>Help & Support</h2>
                            <p className="section-desc">Answers to common questions and ways to get help.</p>

                            <div className="faq-list">
                                {[
                                    { q: 'How does the meal recommendation work?', a: 'MoodMeal scans your pantry and matches recipes based on available ingredients, then further filters by your mood, time, and budget settings.' },
                                    { q: 'How do I add items to My Saves?', a: 'Go to the Meals page, search for recipes, and click the heart icon on any recipe card. It will be added to My Saves instantly.' },
                                    { q: 'How do expiry alerts work?', a: 'When you add an expiry date to a pantry item, MoodMeal will show a warning on your Home dashboard 3 days before it expires.' },
                                    { q: 'Can I change my email address?', a: 'Email addresses cannot be changed at this time. You would need to create a new account with a different email.' },
                                    { q: 'How do I delete my data?', a: 'You can permanently delete your account and all associated data from the Danger Zone section in Settings.' },
                                ].map((item, i) => (
                                    <details key={i} className="faq-item">
                                        <summary>{item.q}</summary>
                                        <p>{item.a}</p>
                                    </details>
                                ))}
                            </div>

                            <div className="help-contact card">
                                <h3>Still need help?</h3>
                                <p>Reach out to our team and we will get back to you within 24 hours.</p>
                                <a href="mailto:support@moodmeal.app" className="btn btn-outline">
                                    Contact Support
                                </a>
                            </div>
                        </div>
                    )}

                    {/* DANGER ZONE */}
                    {active === 'danger' && (
                        <div className="settings-section card danger-section">
                            <h2>Danger Zone</h2>
                            <p className="section-desc">These actions are permanent and cannot be undone.</p>

                            <div className="danger-box">
                                <div className="danger-box-header">
                                    <strong>Delete Account</strong>
                                    <p>This will permanently delete your account, pantry, saved recipes, and all expense history. There is no going back.</p>
                                </div>
                                <div className="danger-fields">
                                    <div className="form-group">
                                        <label>Confirm with your password</label>
                                        <input type="password" placeholder="Your current password"
                                            value={deletePass} onChange={e => setDeletePass(e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Type DELETE to confirm</label>
                                        <input placeholder='Type "DELETE"'
                                            value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} />
                                    </div>
                                    <button
                                        className="btn btn-danger"
                                        onClick={handleDeleteAccount}
                                        disabled={deleteConfirm !== 'DELETE' || !deletePass}
                                    >
                                        Permanently Delete Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
