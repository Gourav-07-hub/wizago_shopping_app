import { useState, useRef } from 'react';
import { UserPlus, LogIn, Mail, Lock, User, Camera, X, Wand2 } from 'lucide-react';
import { authAPI } from './services/api';
import './AuthPage.css';

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileRef = useRef(null);

  const [role, setRole] = useState(() => {
    return localStorage.getItem('wizago_role') || 'customer';
  });

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    shopName: '',
  });

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    localStorage.setItem('wizago_role', selectedRole);
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSignup = async () => {
    const result = await authAPI.register({
      name: form.name,
      email: form.email,
      password: form.password,
      role,
      shopName: role === 'vendor' ? form.shopName : null,
      phone: '',
      avatar: avatarPreview || null,
    });

    localStorage.setItem('wizago_token', result.token);
    localStorage.setItem('wizago_user', JSON.stringify(result.user));
    localStorage.setItem('wizago_role', result.user.role);
    onAuth(result.user, result.token);
  };

  const handleLogin = async () => {
    const result = await authAPI.login({
      email: form.email,
      password: form.password,
    });

    localStorage.setItem('wizago_token', result.token);
    localStorage.setItem('wizago_user', JSON.stringify(result.user));
    localStorage.setItem('wizago_role', result.user.role);
    onAuth(result.user, result.token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!form.email || !form.password) {
        setError('Email and password are required');
        setLoading(false);
        return;
      }

      if (mode === 'register') {
        if (!form.name) { setError('Name is required'); setLoading(false); return; }
        if (form.password !== form.confirm) { setError('Passwords do not match'); setLoading(false); return; }
        if (form.password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return; }
        if (role === 'vendor' && !form.shopName) { setError('Shop Name is required for Vendors'); setLoading(false); return; }

        await handleSignup();
      } else {
        await handleLogin();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  return (
    <div className="auth-page">
      <div className="magic-circle" aria-hidden="true" />
      <div className="auth-brand-header">
        <Wand2 size={24} />
        <span>Wizago Shop</span>
      </div>
      <div className="auth-card">
        <div className="auth-brand">
          <h1 className="auth-title">
            {mode === 'login' ? 'Welcome Back' : 'Join the Circle'}
          </h1>
          <p className="auth-sub">
            {mode === 'login'
              ? 'Sign in to access your account'
              : 'Create your account to start today'}
          </p>
        </div>

        {/* Role Cards Selector */}
        <div className="role-selector-container">
          <div
            className={`role-card ${role === 'customer' ? 'selected' : ''}`}
            onClick={() => handleRoleChange('customer')}
          >
            <div className="role-icon">🛒</div>
            <div className="role-title">Customer</div>
            <div className="role-desc">Browse & buy products</div>
          </div>
          <div
            className={`role-card ${role === 'vendor' ? 'selected' : ''}`}
            onClick={() => handleRoleChange('vendor')}
          >
            <div className="role-icon">🏪</div>
            <div className="role-title">Vendor</div>
            <div className="role-desc">Sell & manage your products</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error">
              <X size={14} />
              {error}
            </div>
          )}

          {mode === 'register' && (
            <>
              <div className="auth-avatar-section">
                <div className={`auth-avatar-circle ${avatarPreview ? 'has-preview' : ''}`} onClick={() => fileRef.current?.click()}>
                  {avatarPreview ? (
                    <>
                      <img src={avatarPreview} alt="Avatar preview" />
                      <div className="auth-avatar-edit-overlay">
                        ✎
                      </div>
                    </>
                  ) : (
                    <>
                      <Camera size={24} className="auth-avatar-camera-icon" />
                      <span className="auth-avatar-upload-text">Upload Photo</span>
                    </>
                  )}
                </div>
                <span className="auth-avatar-label">Upload Profile Picture</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  style={{ display: 'none' }}
                />
              </div>

              <div className="form-group">
                <label><User size={13} /> Name</label>
                <input className="neo-input" placeholder="e.g. John Doe" value={form.name} onChange={update('name')} />
              </div>
            </>
          )}

          <div className="form-group">
            <label><Mail size={13} /> Email</label>
            <input className="neo-input" type="email" placeholder="user@wizago.com" value={form.email} onChange={update('email')} />
          </div>

          <div className="form-group">
            <label><Lock size={13} /> Password</label>
            <input className="neo-input" type="password" placeholder="••••••••" value={form.password} onChange={update('password')} />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label><Lock size={13} /> Confirm Password</label>
              <input className="neo-input" type="password" placeholder="Confirm your password" value={form.confirm} onChange={update('confirm')} />
            </div>
          )}

          {mode === 'register' && role === 'vendor' && (
            <div className="form-group">
              <label>Shop Name</label>
              <input className="neo-input" placeholder="e.g. Wizago Central Store" value={form.shopName} onChange={update('shopName')} />
            </div>
          )}

          <button type="submit" className="neo-btn wizago-btn auth-submit" disabled={loading}>
            {loading ? (
              <span className="auth-spinner" />
            ) : mode === 'login' ? (
              <><LogIn size={15} /> Sign In</>
            ) : (
              <><UserPlus size={15} /> Register</>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>{mode === 'login' ? "Don't have an account?" : 'Already have an account?'}</span>
          <button className="auth-switch" onClick={switchMode}>
            {mode === 'login' ? 'Register here' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
