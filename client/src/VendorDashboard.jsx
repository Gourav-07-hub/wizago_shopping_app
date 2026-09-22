import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BarChart3, TrendingUp, Package, ShieldAlert, LogOut, ListOrdered } from 'lucide-react';
import './VendorDashboard.css';

const useCountUp = (target, duration = 1500) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  
  return count;
};

export default function VendorDashboard({ onLogout }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    productsListed: 10, // Default products count
    pendingDispatches: 0
  });

  const user = JSON.parse(localStorage.getItem('wizago_user') || '{}');

  useEffect(() => {
    // Calculate stats from wizago_orders
    const orders = JSON.parse(localStorage.getItem('wizago_orders') || '[]');
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.grandTotal || order.total || 0), 0);
    const pendingDispatches = orders.filter(order => ['Placed', 'Pending', 'pending', 'packed'].includes(order.status)).length;

    /* eslint-disable react-hooks/set-state-in-effect */
    setStats({
      totalOrders,
      totalRevenue,
      productsListed: 10,
      pendingDispatches
    });
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const animatedOrders = useCountUp(stats.totalOrders);
  const animatedRevenue = useCountUp(stats.totalRevenue);
  const animatedProducts = useCountUp(stats.productsListed);
  const animatedPending = useCountUp(stats.pendingDispatches);

  const handleDashboardLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('wizago_token');
      localStorage.removeItem('wizago_user');
      localStorage.removeItem('wizago_role');
      navigate('/login');
    }
  };

  return (
    <div className="vendor-dashboard-container">
      {/* Header */}
      <header className="vendor-header">
        <div className="vendor-header-inner">
          <div className="vendor-logo">
            <span>Wizago Vendor</span>
          </div>
          <div className="vendor-header-right">
            <span className="vendor-welcome">Welcome back, <strong>{user.name || 'Vendor'}</strong></span>
            {user.shopName && <span className="shop-tag">{user.shopName}</span>}
            <button className="logout-btn" onClick={handleDashboardLogout}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="vendor-content">
        <div className="dashboard-title-section">
          <h1 className="dashboard-title">Vendor Dashboard</h1>
          <p className="dashboard-subtitle">Manage your shop operations, view invoice metrics, and list products.</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-icon orders-icon">
              <ListOrdered size={24} />
            </div>
            <div className="stat-card-info">
              <span className="stat-label">Total Orders</span>
              <strong className="stat-value">{animatedOrders}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon revenue-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-card-info">
              <span className="stat-label">Total Revenue</span>
              <strong className="stat-value">₹{animatedRevenue.toFixed(2)}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon products-icon">
              <Package size={24} />
            </div>
            <div className="stat-card-info">
              <span className="stat-label">Products Listed</span>
              <strong className="stat-value">{animatedProducts}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon dispatches-icon">
              <ShieldAlert size={24} />
            </div>
            <div className="stat-card-info">
              <span className="stat-label">Pending Dispatches</span>
              <strong className="stat-value">{animatedPending}</strong>
            </div>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="quick-links-section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="quick-links-grid">
            <Link to="/vendor/orders" className="quick-link-card">
              <div className="quick-icon-wrapper orders-color">
                <BarChart3 size={24} />
              </div>
              <div className="quick-card-details">
                <h3>View Orders & Logs</h3>
                <p>Track order dispatches, view invoice records, and edit past transactions.</p>
              </div>
            </Link>

            <Link to="/vendor/products" className="quick-link-card">
              <div className="quick-icon-wrapper" style={{ backgroundColor: '#d97706', color: '#fff', fontSize: '24px' }}>
                📦
              </div>
              <div className="quick-card-details">
                <h3>Manage Products</h3>
                <p>Add, edit, or remove products from your store inventory.</p>
              </div>
            </Link>

            <Link to="/vendor/delivery-partners" className="quick-link-card">
              <div className="quick-icon-wrapper" style={{ backgroundColor: '#2563eb', color: '#fff', fontSize: '24px' }}>
                🛵
              </div>
              <div className="quick-card-details">
                <h3>Delivery Partners</h3>
                <p>Assign and manage your delivery agents and track active deliveries.</p>
              </div>
            </Link>

            <Link to="/vendor/reports" className="quick-link-card">
              <div className="quick-icon-wrapper" style={{ backgroundColor: '#16a34a', color: '#fff', fontSize: '24px' }}>
                📈
              </div>
              <div className="quick-card-details">
                <h3>Revenue Reports</h3>
                <p>View monthly revenue, top products, and sales analytics.</p>
              </div>
            </Link>

            <Link to="/vendor/settings" className="quick-link-card">
              <div className="quick-icon-wrapper" style={{ backgroundColor: '#7c3aed', color: '#fff', fontSize: '24px' }}>
                ⚙️
              </div>
              <div className="quick-card-details">
                <h3>Shop Settings</h3>
                <p>Update your shop name, contact info, and vendor preferences.</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
