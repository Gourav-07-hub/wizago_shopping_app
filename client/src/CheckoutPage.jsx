import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from './context/CartContext';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const { cart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [priority, setPriority] = useState('normal'); // 'normal' | 'high' | 'urgent'

  const PRIORITY_FEES = {
    normal: 0,
    high: 1200,
    urgent: 2800
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const deliveryCharge = subtotal >= 500 || subtotal === 0 ? 0 : 40;
  const tax = subtotal * 0.08;
  const priorityFee = PRIORITY_FEES[priority];
  const total = subtotal + deliveryCharge + tax + priorityFee;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const generateOrderId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `ORD-${result}`;
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!form.name.trim() || !form.phone.trim() || !form.street.trim() || !form.city.trim() || !form.state.trim() || !form.pincode.trim()) {
      setError('Please fill in all delivery address fields.');
      return;
    }

    if (cart.length === 0) {
      setError('Your cart is empty. Cannot place an empty order.');
      return;
    }

    const orderId = generateOrderId();
    const nowIso = new Date().toISOString();
    const user = JSON.parse(localStorage.getItem('wizago_user') || '{}');

    // Add timeline events
    const timeline = [
      {
        event: "Order Placed",
        detail: "Order successfully placed by customer",
        timestamp: new Date().toLocaleString('en-IN')
      },
      {
        event: "Payment",
        detail: paymentMethod === 'Cash on Delivery' ? "Skipped / Unpaid" : "Paid",
        timestamp: new Date().toLocaleString('en-IN')
      }
    ];

    // Prepare order object matching the general rules exactly
    const newOrder = {
      id: orderId,
      date: new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      customerName: form.name, // Keep for legacy compatibility
      phone: form.phone, // Keep for legacy compatibility
      address: `${form.street}, ${form.city}, ${form.state} - ${form.pincode}`, // Keep for legacy compatibility
      customer: {
        name: form.name,
        email: user.email || 'customer@wizago.com',
        state: form.state,
        address: `${form.street}, ${form.city} - ${form.pincode}`
      },
      items: cart.map(item => ({
        name: item.name,
        qty: item.qty,
        price: item.price,
        discount: item.discount || 0,
        tax: item.tax || 8
      })),
      subtotal,
      priorityFee,
      packagingFee: 0,
      shippingFee: deliveryCharge,
      grandTotal: total,
      priority,
      packaging: 'Standard Polybag',
      deliveryMethod: 'Standard Ground Owl',
      assignedEmployee: 'Unassigned',
      notes: '',
      status: 'pending',
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'unpaid' : 'paid',
      timeline,
      createdAt: nowIso,
      deliveredAt: null,
      // legacy keys for POS compatibility
      deliveryCharge,
      tax,
      total,
      paymentMethod
    };

    // Save order to localStorage wizago_orders
    try {
      const savedOrders = JSON.parse(localStorage.getItem('wizago_orders') || '[]');
      savedOrders.unshift(newOrder);
      localStorage.setItem('wizago_orders', JSON.stringify(savedOrders));
    } catch (err) {
      console.error('Failed to save order to history:', err);
    }

    // Success action
    setSuccess(true);
    setTimeout(() => {
      clearCart();
      navigate('/');
    }, 2000);
  };

  return (
    <div className="checkout-page-container">
      <header className="checkout-header">
        <div className="checkout-header-inner">
          <div className="checkout-logo" onClick={() => navigate('/')}>
            <span>Wizago Shop</span>
          </div>
          <Link to="/cart" className="back-link">
            <ArrowLeft size={16} /> Back to Cart
          </Link>
        </div>
      </header>

      {success && (
        <div className="toast-overlay">
          <div className="success-toast">
            <CheckCircle size={48} className="success-toast-icon" />
            <h2>Order placed successfully! 🎉</h2>
            <p>Thank you for shopping with Wizago. Redirecting to home page...</p>
          </div>
        </div>
      )}

      <main className="checkout-content">
        <h1 className="checkout-page-title">Checkout</h1>

        <div className="checkout-layout">
          {/* Checkout Forms (Left) */}
          <div className="checkout-form-section">
            <form onSubmit={handlePlaceOrder} className="checkout-form">
              {error && <div className="checkout-error">{error}</div>}

              {/* Priority Shipping Section */}
              <div className="form-card">
                <h3 className="form-card-title">Select Priority</h3>
                <div className="priority-section">
                  <div
                    className={`priority-card ${priority === 'normal' ? 'active' : 'dimmed'}`}
                    onClick={() => setPriority('normal')}
                    style={{ border: priority === 'normal' ? '2px solid #F5C400' : '2px solid #2d2d4f' }}
                  >
                    <span className="priority-card-title-text">🟢 NORMAL</span>
                    <span className="priority-card-desc">Standard timing</span>
                    <span className="priority-card-price">Free</span>
                  </div>
                  <div
                    className={`priority-card ${priority === 'high' ? 'active' : 'dimmed'}`}
                    onClick={() => setPriority('high')}
                    style={{ border: priority === 'high' ? '2px solid #F5C400' : '2px solid #2d2d4f' }}
                  >
                    <span className="priority-card-title-text">🔥 HIGH</span>
                    <span className="priority-card-desc">Priority processing</span>
                    <span className="priority-card-price">+₹1,200</span>
                  </div>
                  <div
                    className={`priority-card ${priority === 'urgent' ? 'active' : 'dimmed'}`}
                    onClick={() => setPriority('urgent')}
                    style={{ border: priority === 'urgent' ? '2px solid #F5C400' : '2px solid #2d2d4f' }}
                  >
                    <span className="priority-card-title-text">🚨 URGENT</span>
                    <span className="priority-card-desc">Immediate dispatch</span>
                    <span className="priority-card-price">+₹2,800</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address Form Card */}
              <div className="form-card">
                <h3 className="form-card-title">Enter Delivery Address</h3>
                <div className="form-grid">
                  <div className="form-group col-full">
                    <label htmlFor="name">Name</label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      className="neo-input"
                      placeholder="e.g. Harry Potter"
                      value={form.name}
                      onChange={handleChange}
                      disabled={success}
                    />
                  </div>

                  <div className="form-group col-full">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      className="neo-input"
                      placeholder="e.g. +91 98765 43210"
                      value={form.phone}
                      onChange={handleChange}
                      disabled={success}
                    />
                  </div>

                  <div className="form-group col-full">
                    <label htmlFor="street">Street Address</label>
                    <input
                      id="street"
                      type="text"
                      name="street"
                      className="neo-input"
                      placeholder="e.g. 4 Privet Drive"
                      value={form.street}
                      onChange={handleChange}
                      disabled={success}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      id="city"
                      type="text"
                      name="city"
                      className="neo-input"
                      placeholder="e.g. Little Whinging"
                      value={form.city}
                      onChange={handleChange}
                      disabled={success}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="state">State</label>
                    <input
                      id="state"
                      type="text"
                      name="state"
                      className="neo-input"
                      placeholder="e.g. Surrey"
                      value={form.state}
                      onChange={handleChange}
                      disabled={success}
                    />
                  </div>

                  <div className="form-group col-full">
                    <label htmlFor="pincode">Pincode</label>
                    <input
                      id="pincode"
                      type="text"
                      name="pincode"
                      className="neo-input"
                      placeholder="e.g. 400001"
                      value={form.pincode}
                      onChange={handleChange}
                      disabled={success}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selector Card */}
              <div className="form-card">
                <h3 className="form-card-title">Select Payment Method</h3>
                <div className="payment-options">
                  {['Cash on Delivery', 'UPI', 'Card'].map((method) => (
                    <label
                      key={method}
                      className={`payment-option-label ${paymentMethod === method ? 'active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={() => setPaymentMethod(method)}
                        disabled={success}
                      />
                      <span className="radio-custom"></span>
                      <span className="payment-method-name">{method}</span>
                    </label>
                  ))}
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary Sidebar (Right) */}
          <div className="checkout-summary-sidebar">
            <div className="summary-card">
              <h3 className="summary-title">Order Summary</h3>

              <div className="summary-items-preview">
                {cart.map((item) => (
                  <div key={item.id} className="preview-item">
                    <span className="preview-item-qty">{item.qty}x</span>
                    <span className="preview-item-name">{item.name}</span>
                    <span className="preview-item-price">₹{(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row">
                <span>Subtotal</span>
                <strong>₹{subtotal.toFixed(2)}</strong>
              </div>

              <div className="summary-row">
                <span>Delivery Charge</span>
                {deliveryCharge === 0 ? (
                  <span className="free-delivery">FREE</span>
                ) : (
                  <strong>₹{deliveryCharge.toFixed(2)}</strong>
                )}
              </div>

              <div className="summary-row">
                <span>Tax (8%)</span>
                <strong>₹{tax.toFixed(2)}</strong>
              </div>

              <div className="summary-row">
                <span>Priority ({priority.toUpperCase()})</span>
                <strong>{priorityFee === 0 ? 'FREE' : `₹${priorityFee.toFixed(2)}`}</strong>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row total-row">
                <span>Total to Pay</span>
                <span className="grand-total-val">₹{total.toFixed(2)}</span>
              </div>

              <button
                type="button"
                className="neo-btn primary place-order-btn"
                onClick={handlePlaceOrder}
                disabled={success || cart.length === 0}
              >
                Place Order (₹{total.toFixed(2)})
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
