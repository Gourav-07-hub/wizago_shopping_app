import { useState, useRef } from 'react';
import { UserPlus, LogIn, Mail, Lock, User, Camera, X, Wand2 } from 'lucide-react';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Email and password are required');
      return;
    }

    if (mode === 'register') {
      if (!form.name) { setError('Name is required'); return; }
      if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
      if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
      if (role === 'vendor' && !form.shopName) { setError('Shop Name is required for Vendors'); return; }

      // Save to localStorage wizago_users
      const users = JSON.parse(localStorage.getItem('wizago_users') || '[]');
      if (users.some(u => u.email.toLowerCase() === form.email.toLowerCase())) {
        setError('Email already registered');
        return;
      }

      const newUser = {
        name: form.name,
        email: form.email.toLowerCase(),
        password: form.password,
        role: role,
        shopName: role === 'vendor' ? form.shopName : '',
        avatar: avatarPreview || ''
      };

      users.push(newUser);
      localStorage.setItem('wizago_users', JSON.stringify(users));

      alert('Registration successful! You can now log in.');
      setMode('login');
      setForm({
        name: '',
        email: form.email,
        password: '',
        confirm: '',
        shopName: '',
      });
      return;
    }

    // Login mode
    setLoading(true);
    setTimeout(() => {
      try {
        const emailLower = form.email.toLowerCase();
        // Hardcoded accounts
        const hardcodedUsers = [
          { name: 'John Customer', email: 'customer@wizago.com', password: 'password', role: 'customer', shopName: '' },
          { name: 'Jane Vendor', email: 'vendor@wizago.com', password: 'password', role: 'vendor', shopName: 'Wizago Central Shop' }
        ];

        // Retrieve registered users
        const registeredUsers = JSON.parse(localStorage.getItem('wizago_users') || '[]');
        const allUsers = [...hardcodedUsers, ...registeredUsers];

        const user = allUsers.find(u => u.email === emailLower && u.password === form.password);

        if (!user) {
          setError('Invalid email or password');
          setLoading(false);
          return;
        }

        // Check if the selected role matches their actual registered role
        if (user.role !== role) {
          setError(`This account is registered as a ${user.role}, but you selected ${role}.`);
          setLoading(false);
          return;
        }

        // Successfully logged in!
        localStorage.setItem('wizago_token', 'mock-token-xyz');
        localStorage.setItem('wizago_user', JSON.stringify(user));
        localStorage.setItem('wizago_role', user.role);

        onAuth(user, 'mock-token-xyz');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 500);
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
                <div className="auth-avatar-circle" onClick={() => fileRef.current?.click()}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" />
                  ) : (
                    <Camera size={22} />
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
