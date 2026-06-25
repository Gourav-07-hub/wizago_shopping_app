import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import DeliveryProgress from '../components/DeliveryProgress';
import './OrderConfirmation.css';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedOrders = JSON.parse(localStorage.getItem('wizago_orders') || '[]');
      const foundOrder = savedOrders.find(o => o.id === orderId);
      if (foundOrder) {
        setOrder(foundOrder); // eslint-disable-line react-hooks/set-state-in-effect
      }
    } catch (err) {
      console.error('Error loading order for confirmation:', err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="confirmation-container">
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{
            margin: '0 auto 1rem',
            border: '3px solid #2d2d4f',
            borderTop: '3px solid #f5c400',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p>Finding order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="confirmation-container">
        <div className="confirmation-card not-found-container">
          <AlertTriangle size={64} style={{ color: '#e53e3e', marginBottom: '1.5rem' }} />
          <h2 className="not-found-title">Order Not Found</h2>
          <p style={{ color: '#cbd5e0', marginBottom: '2rem' }}>
            We couldn't locate the order details for ID <strong>{orderId}</strong>.
          </p>
          <div className="actions-container">
            <Link to="/" className="action-btn primary">Go to Home</Link>
            <Link to="/orders" className="action-btn secondary">View My Orders</Link>
          </div>
        </div>
      </div>
    );
  }

  const isPaid = order.paymentStatus === 'paid';

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        <div className="confirmation-header">
          <span className="confirmation-icon">🎉</span>
          <h1 className="confirmation-title">Order Confirmed!</h1>
          <p className="confirmation-subtitle">Thank you for shopping with Wizago Shop!</p>
        </div>

        <div className="info-box">
          <div className="info-item">
            <span className="info-label">Order ID</span>
            <span className="info-value" style={{ color: '#f5c400' }}>#{order.id}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Payment</span>
            <span className="info-value">
              <span className={`payment-badge ${isPaid ? 'paid' : 'unpaid'}`}>
                {order.paymentMethod === 'razorpay' ? '✅ Paid via Razorpay' : '🏠 Cash on Delivery'}
              </span>
            </span>
          </div>
          {order.paymentMethod === 'razorpay' && order.paymentDetails?.paymentId && (
            <div className="info-item">
              <span className="info-label">Razorpay Payment ID</span>
              <span className="info-value" style={{ fontFamily: 'monospace', color: '#cbd5e0', fontSize: '0.85rem' }}>
                {order.paymentDetails.paymentId}
              </span>
            </div>
          )}
          <div className="info-item">
            <span className="info-label">Order Date</span>
            <span className="info-value">
              {order.date || new Date(order.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>

        {/* Delivery Tracking */}
        {order.delivery && (
          <div className="summary-section">
            <h3 className="summary-section-title">📦 Delivery Tracking</h3>
            <div className="delivery-tracking-card">
              <div className="delivery-partner-info">
                <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>{order.delivery.carrierLogo || '⚡'}</span>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff' }}>
                    {order.delivery.carrierName} {order.delivery.speedLabel}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                    Delivering to: {order.customer?.name || order.customerName}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                    {order.customer?.address || order.address}, {order.customer?.state}
                  </div>
                </div>
              </div>
              <div className="delivery-estimated-date">
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Estimated Delivery</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#f5c400' }}>
                  {order.delivery.estimatedLabel || 'N/A'}
                </div>
                {order.delivery.estimatedDate && (
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    {new Date(order.delivery.estimatedDate).toLocaleDateString('en-IN', {
                      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </div>
                )}
              </div>
              <DeliveryProgress
                deliveryStatus={order.deliveryStatus || 'order_placed'}
                timeline={order.timeline || []}
              />
            </div>
          </div>
        )}

        {/* Full Order Summary */}
        <div className="summary-section">
          <h3 className="summary-section-title">Items Ordered</h3>
          <table className="items-table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th style={{ textAlign: 'center' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Price</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td style={{ textAlign: 'center' }}><span className="item-qty">{item.qty}x</span></td>
                  <td style={{ textAlign: 'right' }}>₹{item.price.toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>₹{(item.price * item.qty).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="totals-container">
            <div className="total-row-item">
              <span>Subtotal:</span>
              <strong>₹{order.subtotal?.toFixed(2)}</strong>
            </div>
            {order.shippingFee !== undefined && (
              <div className="total-row-item">
                <span>Shipping:</span>
                <strong>{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee.toFixed(2)}`}</strong>
              </div>
            )}
            {order.tax !== undefined && (
              <div className="total-row-item">
                <span>Tax (8%):</span>
                <strong>₹{order.tax.toFixed(2)}</strong>
              </div>
            )}
            {order.priorityFee > 0 && (
              <div className="total-row-item">
                <span>Priority Fee ({order.priority?.toUpperCase()}):</span>
                <strong>+₹{order.priorityFee.toFixed(2)}</strong>
              </div>
            )}
            {order.packagingFee > 0 && (
              <div className="total-row-item">
                <span>Packaging Fee:</span>
                <strong>+₹{order.packagingFee.toFixed(2)}</strong>
              </div>
            )}
            <div className="total-row-item grand-total">
              <span>Grand Total:</span>
              <strong style={{ color: '#f5c400' }}>₹{(order.grandTotal || order.total).toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="summary-section">
          <h3 className="summary-section-title">Shipping Details</h3>
          <div className="address-box">
            <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '0.25rem' }}>
              {order.customer?.name || order.customerName}
            </div>
            <div>{order.customer?.address || order.address}</div>
            <div>{order.customer?.state}</div>
            <div style={{ marginTop: '0.5rem', color: '#a0aec0', fontSize: '0.85rem' }}>
              📞 Phone: {order.customer?.phone || order.phone}
            </div>
            <div style={{ color: '#a0aec0', fontSize: '0.85rem' }}>
              ✉️ Email: {order.customer?.email || 'N/A'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="actions-container">
          <Link to="/orders" className="action-btn secondary">
            View All Orders
          </Link>
          <Link to="/" className="action-btn primary">
            Continue Shopping <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
          </Link>
        </div>
      </div>
    </div>
  );
}
