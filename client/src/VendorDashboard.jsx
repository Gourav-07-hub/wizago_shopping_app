import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BarChart3, TrendingUp, Package, ShieldAlert, LogOut, ListOrdered } from 'lucide-react';
import './VendorDashboard.css';

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
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const pendingDispatches = orders.filter(order => order.status === 'Placed' || order.status === 'Pending').length;

    /* eslint-disable react-hooks/set-state-in-effect */
    setStats({
      totalOrders,
      totalRevenue,
      productsListed: 10,
      pendingDispatches
    });
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

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
              <strong className="stat-value">{stats.totalOrders}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon revenue-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-card-info">
              <span className="stat-label">Total Revenue</span>
              <strong className="stat-value">₹{stats.totalRevenue.toFixed(2)}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon products-icon">
              <Package size={24} />
            </div>
            <div className="stat-card-info">
              <span className="stat-label">Products Listed</span>
              <strong className="stat-value">{stats.productsListed}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon dispatches-icon">
              <ShieldAlert size={24} />
            </div>
            <div className="stat-card-info">
              <span className="stat-label">Pending Dispatches</span>
              <strong className="stat-value">{stats.pendingDispatches}</strong>
            </div>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="quick-links-section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="quick-links-grid">
            <Link to="/vendor/orders" className="quick-link-card">
              <div className="quick-icon-wrapper orders-color">
                <BarChart3 size={32} />
              </div>
              <div className="quick-card-details">
                <h3>View Orders & Logs</h3>
                <p>Track order dispatches, view invoice records, and edit past transactions.</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
