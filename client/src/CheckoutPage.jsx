import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from './context/CartContext';
import { ArrowLeft } from 'lucide-react';
import { loadRazorpayScript, useRazorpay } from './hooks/useRazorpay';
import PaymentMethod from './components/PaymentMethod';
import PincodeChecker from './components/PincodeChecker';
import DeliveryOptions from './components/DeliveryOptions';
import FreeDeliveryBar from './components/FreeDeliveryBar';
import { getPincodeZone } from './utils/pincodeZones';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const { cart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // default selected: Pay Online ('razorpay')
  const [paymentStatus, setPaymentStatus] = useState(''); // eslint-disable-line no-unused-vars
  const [priority, setPriority] = useState('normal'); // 'normal' | 'high' | 'urgent'
  const [toast, setToast] = useState(null);
  const [deliveryOption, setDeliveryOption] = useState(null);

  const { isProcessing: isProcessingPayment, handleRazorpayPayment } = useRazorpay();

  const PRIORITY_FEES = {
    normal: 0,
    high: 1200,
    urgent: 2800
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const tax = subtotal * 0.08;
  const priorityFee = PRIORITY_FEES[priority];
  const checkoutPincode = form.pincode.trim() || localStorage.getItem('wizago_pincode') || '';
  const deliveryCharge = subtotal >= 500 || subtotal === 0 ? (deliveryOption ? deliveryOption.price : 0) : (deliveryOption ? deliveryOption.price : 40);
  const total = subtotal + deliveryCharge + tax + priorityFee;

  // Load script on mount
  useEffect(() => {
    loadRazorpayScript().then(loaded => {
      if (!loaded) {
        console.warn("Razorpay script failed to load on mount");
      }
    });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Payment failed handler
  const onPaymentFailed = (response) => {
    console.error("Payment failed:", response.error);
    showToast(
      `Payment failed: ${response.error.description}. Please try again.`,
      "error"
    );
    setPaymentStatus("failed");
  };

  // Payment success handler
  const onPaymentSuccess = (response, generatedOrderId) => {
    const paymentDetails = {
      paymentId: response.razorpay_payment_id,
      method: "razorpay",
      status: "paid",
      paidAt: new Date().toISOString(),
    };

    const customerName = form.name.trim();
    const customerEmail = JSON.parse(localStorage.getItem('wizago_user') || '{}').email || 'customer@wizago.com';
    const address = `${form.street.trim()}, ${form.city.trim()} - ${form.pincode.trim()}`;
    const state = form.state.trim();

    // 1. Create the order object
    const newOrder = {
      id: generatedOrderId,
      date: new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      customerName: customerName,
      phone: customerPhone,
      address: `${form.street.trim()}, ${form.city.trim()}, ${state} - ${form.pincode.trim()}`,
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        state,
        address
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
      deliveryMethod: deliveryOption ? `${deliveryOption.carrier} ${deliveryOption.speedLabel}` : 'Standard Ground Owl',
      assignedEmployee: 'Unassigned',
      notes: '',
      status: 'pending',
      paymentMethod: "razorpay",
      paymentStatus: "paid",
      paymentDetails,
      delivery: deliveryOption ? {
        carrierId: deliveryOption.carrierId,
        carrierName: deliveryOption.carrier,
        speedId: deliveryOption.speedId,
        speedLabel: deliveryOption.speedLabel,
        estimatedDate: deliveryOption.date?.toISOString() || null,
        estimatedLabel: deliveryOption.label,
        deliveryFee: deliveryOption.price,
        pincode: form.pincode.trim() || checkoutPincode,
        city: getPincodeZone(form.pincode.trim() || checkoutPincode).city,
        state: getPincodeZone(form.pincode.trim() || checkoutPincode).state,
      } : null,
      deliveryStatus: 'order_placed',
      timeline: [
        {
          event: "Order Placed",
          detail: deliveryOption ? `Handed to ${deliveryOption.carrier} ${deliveryOption.speedLabel}` : "Order confirmed",
          timestamp: new Date().toISOString()
        },
        {
          event: "Payment",
          detail: `Paid ₹${total.toFixed(2)} via Razorpay · ID: ${response.razorpay_payment_id}`,
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      deliveredAt: null,
      
      // legacy keys for POS compatibility
      deliveryCharge,
      tax,
      total
    };

    // 2. Save to localStorage
    const existing = JSON.parse(localStorage.getItem("wizago_orders") || "[]");
    localStorage.setItem("wizago_orders", JSON.stringify([newOrder, ...existing]));

    // 3. Clear cart
    clearCart();
    localStorage.removeItem("wizago_cart");

    // 4. Show success toast
    showToast("Payment successful! Order placed 🎉", "success");

    // 5. Redirect to order confirmation page
    setTimeout(() => navigate(`/orders/${generatedOrderId}`), 1500);
  };

  // Cash on Delivery handler
  const handleCODOrder = (generatedOrderId) => {
    const customerName = form.name.trim();
    const customerEmail = JSON.parse(localStorage.getItem('wizago_user') || '{}').email || 'customer@wizago.com';
    const address = `${form.street.trim()}, ${form.city.trim()} - ${form.pincode.trim()}`;
    const state = form.state.trim();

    const newOrder = {
      id: generatedOrderId,
      date: new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      customerName: customerName,
      phone: customerPhone,
      address: `${form.street.trim()}, ${form.city.trim()}, ${state} - ${form.pincode.trim()}`,
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        state,
        address
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
      deliveryMethod: deliveryOption ? `${deliveryOption.carrier} ${deliveryOption.speedLabel}` : 'Standard Ground Owl',
      assignedEmployee: 'Unassigned',
      notes: '',
      status: 'pending',
      paymentMethod: "cod",
      paymentStatus: "unpaid",
      paymentDetails: null,
      delivery: deliveryOption ? {
        carrierId: deliveryOption.carrierId,
        carrierName: deliveryOption.carrier,
        speedId: deliveryOption.speedId,
        speedLabel: deliveryOption.speedLabel,
        estimatedDate: deliveryOption.date?.toISOString() || null,
        estimatedLabel: deliveryOption.label,
        deliveryFee: deliveryOption.price,
        pincode: form.pincode.trim() || checkoutPincode,
        city: getPincodeZone(form.pincode.trim() || checkoutPincode).city,
        state: getPincodeZone(form.pincode.trim() || checkoutPincode).state,
      } : null,
      deliveryStatus: 'order_placed',
      timeline: [
        {
          event: "Order Placed",
          detail: deliveryOption ? `Handed to ${deliveryOption.carrier} ${deliveryOption.speedLabel}` : "Order confirmed — Cash on Delivery",
          timestamp: new Date().toISOString()
        },
        {
          event: "Payment",
          detail: "Cash on Delivery — Pay when order arrives",
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      deliveredAt: null,

      // legacy keys for POS compatibility
      deliveryCharge,
      tax,
      total
    };

    const existing = JSON.parse(localStorage.getItem("wizago_orders") || "[]");
    localStorage.setItem("wizago_orders", JSON.stringify([newOrder, ...existing]));

    clearCart();
    localStorage.removeItem("wizago_cart");
    showToast("Order placed! Pay on delivery 🏠", "success");
    setTimeout(() => navigate(`/orders/${generatedOrderId}`), 1500);
  };

  const handlePlaceOrder = async (e) => {
    if (e) e.preventDefault();

    const customerName = form.name.trim();
    const customerEmail = JSON.parse(localStorage.getItem('wizago_user') || '{}').email || 'customer@wizago.com';
    const address = `${form.street.trim()}, ${form.city.trim()} - ${form.pincode.trim()}`;
    const state = form.state.trim();

    // 1. Validate form fields first
    if (!customerName || !customerEmail || !customerPhone || 
        !form.street.trim() || !form.city.trim() || !state || !form.pincode.trim()) {
      showToast("Please fill all delivery details", "error");
      return;
    }

    if (customerPhone.length !== 10) {
      showToast("Enter a valid 10-digit phone number", "error");
      return;
    }

    if (cart.length === 0) {
      showToast("Your cart is empty. Cannot place an empty order.", "error");
      return;
    }

    // 2. Generate order ID
    const generatedOrderId = "ORD-" + Math.random().toString(36)
                                .substring(2, 10).toUpperCase();

    // 3. Route to correct payment handler
    if (paymentMethod === "razorpay") {
      await handleRazorpayPayment({
        orderId: generatedOrderId,
        grandTotal: total,
        customerName,
        customerEmail,
        customerPhone,
        deliveryAddress: address,
        onSuccess: (response) => onPaymentSuccess(response, generatedOrderId),
        onFailed: onPaymentFailed,
        onDismiss: () => {
          setPaymentStatus("cancelled");
          showToast("Payment cancelled. Your order was not placed.", "error");
        }
      });
    } else {
      handleCODOrder(generatedOrderId);
    }
  };

  const isFormIncomplete = !form.name.trim() || !customerPhone || !form.street.trim() || !form.city.trim() || !form.state.trim() || !form.pincode.trim();

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

      <main className="checkout-content">
        <h1 className="checkout-page-title">Checkout</h1>

        <div className="checkout-layout">
          {/* Checkout Forms (Left) */}
          <div className="checkout-form-section">
            <form onSubmit={handlePlaceOrder} className="checkout-form">
              
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
                      disabled={isProcessingPayment }
                    />
                  </div>

                  {/* PHONE NUMBER [+91 ________________] */}
                  <div className="form-group col-full">
                    <label htmlFor="phone">Phone Number</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        backgroundColor: '#111122',
                        border: '2px solid #2d2d4f',
                        padding: '0.75rem',
                        borderRadius: '4px',
                        color: '#cbd5e0',
                        fontWeight: 'bold',
                        fontSize: '0.95rem',
                        userSelect: 'none'
                      }}>+91</span>
                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        className="neo-input"
                        style={{ flex: 1 }}
                        placeholder="e.g. 9876543210"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        disabled={isProcessingPayment }
                      />
                    </div>
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
                      disabled={isProcessingPayment }
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
                      disabled={isProcessingPayment }
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
                      disabled={isProcessingPayment }
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
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setForm({ ...form, pincode: val });
                      }}
                      disabled={isProcessingPayment }
                    />
                  </div>
                </div>
              </div>

              <div className="form-card">
                <FreeDeliveryBar cartTotal={subtotal} threshold={500} />
              </div>

              <div className="form-card">
                <PincodeChecker cartTotal={subtotal} onDeliverySelect={(opt) => setDeliveryOption(opt)} />
                {checkoutPincode.length === 6 && (
                  <DeliveryOptions
                    pincode={checkoutPincode}
                    cartTotal={subtotal}
                    onSelect={(opt) => setDeliveryOption(opt)}
                    selectedOption={deliveryOption}
                  />
                )}
              </div>

              {/* Payment Method Selector Card */}
              <PaymentMethod 
                selectedMethod={paymentMethod} 
                onChange={setPaymentMethod} 
                disabled={isProcessingPayment } 
              />
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
                <span>Delivery</span>
                <div style={{ textAlign: 'right' }}>
                  {deliveryOption ? (
                    <>
                      <div style={{ fontSize: '0.8rem', color: deliveryOption.carrierColor }}>
                        {deliveryOption.carrierLogo} {deliveryOption.carrier} {deliveryOption.speedLabel}
                      </div>
                      <div style={{ fontWeight: deliveryOption?.isFree ? 'normal' : 'bold' }}>
                        {deliveryOption.isFree ? (
                          <span className="free-delivery">FREE</span>
                        ) : (
                          <>₹{deliveryOption.price.toFixed(2)}</>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>By {deliveryOption.label}</div>
                    </>
                  ) : (
                    deliveryCharge === 0 ? (
                      <span className="free-delivery">FREE</span>
                    ) : (
                      <strong>₹{deliveryCharge.toFixed(2)}</strong>
                    )
                  )}
                </div>
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
                disabled={isProcessingPayment  || cart.length === 0 || isFormIncomplete}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {isProcessingPayment ? (
                  <>
                    <span className="inline-spinner" style={{
                      border: '2px solid #1a1a2e',
                      borderTop: '2px solid #fff',
                      borderRadius: '50%',
                      width: '16px',
                      height: '16px',
                      animation: 'spin 1s linear infinite'
                    }}></span>
                    Processing...
                  </>
                ) : (
                  `Place Order (₹${total.toFixed(2)}) →`
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Toast Notification Component */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: toast.type === 'success' ? '#1e382a' : '#381e1e',
          border: `2px solid ${toast.type === 'success' ? '#48bb78' : '#e53e3e'}`,
          color: '#fff',
          padding: '1rem 1.5rem',
          borderRadius: '6px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          zIndex: 1100,
          animation: 'slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          <span style={{ fontWeight: 'bold' }}>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
