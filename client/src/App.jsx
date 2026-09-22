import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LeaveShopModal from './components/vendor/LeaveShopModal';
import HorrorBackground from './components/effects/HorrorBackground';
import AuthPage from './AuthPage';
import PosPage from './PosPage';
import HomePage from './HomePage';
import CartPage from './CartPage';
import CheckoutPage from './CheckoutPage';
import VendorDashboard from './VendorDashboard';
import OrderHistoryPage from './OrderHistoryPage';
import VendorOrdersPage from './pages/VendorOrdersPage';
import OrderConfirmation from './pages/OrderConfirmation';

// Protected Route for Customers (requires login)
function CustomerRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Protected Route for Vendors (requires login + role = vendor)
function VendorRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  const role = localStorage.getItem('wizago_role') || user.role;
  if (role === 'customer') {
    return <Navigate to="/" replace />;
  }
  return children;
}

// Route for Login (redirects if already logged in)
function AuthRoute({ user, children }) {
  if (user) {
    const role = localStorage.getItem('wizago_role') || user.role;
    if (role === 'vendor') {
      return <Navigate to="/vendor/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }
  return children;
}

// Placeholder for vendor sections not yet built (prevents 404s from dashboard quick links)
function VendorPlaceholder({ title, description }) {
  return (
    <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{title}</h1>
      <p style={{ opacity: 0.7 }}>{description || 'This section is coming soon.'}</p>
    </div>
  );
}

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('wizago_user'));
    } catch {
      return null;
    }
  });

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [pendingLeaveAction, setPendingLeaveAction] = useState(null); // 'logout' or URL string

  useEffect(() => {
    const handleGlobalClick = (e) => {
      const anchor = e.target.closest('a');
      if (anchor && anchor.href) {
        try {
          const url = new URL(anchor.href);
          if (url.origin !== window.location.origin) {
            e.preventDefault();
            setPendingLeaveAction(anchor.href);
            setShowLeaveModal(true);
          }
        } catch {
          // Ignored
        }
      }
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  const handleAuth = (userData) => {
    setUser(userData);
    const role = localStorage.getItem('wizago_role') || userData.role;
    if (role === 'vendor') {
      navigate('/vendor/dashboard');
    } else {
      navigate('/');
    }
  };

  const triggerLogout = () => {
    setPendingLeaveAction('logout');
    setShowLeaveModal(true);
  };

  const confirmLeave = () => {
    setShowLeaveModal(false);
    
    // Save cart data to localStorage BEFORE logout executes
    const cartData = localStorage.getItem('wizago_cart');
    if (cartData) {
      localStorage.setItem('wizago_cart', cartData);
    }

    if (pendingLeaveAction === 'logout') {
      localStorage.removeItem('wizago_token');
      localStorage.removeItem('wizago_user');
      localStorage.removeItem('wizago_role');
      setUser(null);
      navigate('/login');
    } else if (typeof pendingLeaveAction === 'string') {
      window.location.href = pendingLeaveAction;
    }
  };

  return (
    <>
      <HorrorBackground />
      <Routes>
        {/* Public/Auth Routes */}
        <Route path="/login" element={
          <AuthRoute user={user}>
            <AuthPage onAuth={handleAuth} />
          </AuthRoute>
        } />

        {/* Customer Routes (Protected) */}
        <Route path="/" element={
          <CustomerRoute user={user}>
            <HomePage user={user} onLogout={triggerLogout} />
          </CustomerRoute>
        } />
        <Route path="/cart" element={
          <CustomerRoute user={user}>
            <CartPage />
          </CustomerRoute>
        } />
        <Route path="/checkout" element={
          <CustomerRoute user={user}>
            <CheckoutPage />
          </CustomerRoute>
        } />
        <Route path="/orders" element={
          <CustomerRoute user={user}>
            <OrderHistoryPage />
          </CustomerRoute>
        } />
        <Route path="/orders/:orderId" element={
          <CustomerRoute user={user}>
            <OrderConfirmation />
          </CustomerRoute>
        } />

        {/* Vendor Routes (Protected) */}
        <Route path="/vendor/dashboard" element={
          <VendorRoute user={user}>
            <VendorDashboard onLogout={triggerLogout} />
          </VendorRoute>
        } />
        <Route path="/vendor/orders" element={
          <VendorRoute user={user}>
            <VendorOrdersPage user={user} onLogout={triggerLogout} />
          </VendorRoute>
        } />
        <Route path="/vendor/pos" element={
          <VendorRoute user={user}>
            <PosPage user={user} onLogout={triggerLogout} />
          </VendorRoute>
        } />
        <Route path="/vendor/products" element={
          <VendorRoute user={user}>
            <VendorPlaceholder title="Manage Products" description="Add, edit, or remove products from your store inventory. Coming soon." />
          </VendorRoute>
        } />
        <Route path="/vendor/delivery-partners" element={
          <VendorRoute user={user}>
            <VendorPlaceholder title="Delivery Partners" description="Assign and manage your delivery agents. Coming soon." />
          </VendorRoute>
        } />
        <Route path="/vendor/reports" element={
          <VendorRoute user={user}>
            <VendorPlaceholder title="Revenue Reports" description="Monthly revenue and sales analytics. Coming soon." />
          </VendorRoute>
        } />
        <Route path="/vendor/settings" element={
          <VendorRoute user={user}>
            <VendorPlaceholder title="Shop Settings" description="Update your shop name, contact info, and preferences. Coming soon." />
          </VendorRoute>
        } />

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <LeaveShopModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onConfirm={confirmLeave}
      />
    </>
  );
}

export default App;

