import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from './context/CartContext';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import './CartPage.css';

export default function CartPage() {
  const { cart, updateQty, removeFromCart } = useContext(CartContext);
  const navigate = useNavigate();

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const deliveryCharge = subtotal >= 500 || subtotal === 0 ? 0 : 40;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryCharge + tax;

  const handleQtyChange = (id, newQty) => {
    updateQty(id, newQty);
  };

  return (
    <div className="cart-page-container">
      <header className="cart-header">
        <div className="cart-header-inner">
          <div className="cart-logo" onClick={() => navigate('/')}>
            <span>Wizago Shop</span>
          </div>
          <Link to="/" className="back-link">
            <ArrowLeft size={16} /> Back to Shop
          </Link>
        </div>
      </header>

      <main className="cart-content">
        <h1 className="cart-page-title">Your Cart</h1>

        {cart.length === 0 ? (
          <div className="empty-cart-card">
            <ShoppingBag size={48} className="empty-icon" />
            <h2>Your cart is currently empty</h2>
            <p>Looks like you haven't added any magic products yet.</p>
            <Link to="/" className="neo-btn primary start-shopping-btn">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Cart Items List */}
            <div className="cart-items-list">
              {cart.map((item) => (
                <div key={item.id} className="cart-item-card">
                  <div className="cart-item-details">
                    <div className="cart-item-title-grp">
                      <span className="cart-item-category">{item.category}</span>
                      <h3 className="cart-item-name">{item.name}</h3>
                    </div>
                    <div className="cart-item-price-info">
                      <span className="price-label">Price:</span>
                      <span className="price-val">₹{item.price.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="cart-item-actions">
                    <div className="qty-controls">
                      <button
                        className="qty-btn"
                        onClick={() => handleQtyChange(item.id, item.qty - 1)}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="qty-val">{item.qty}</span>
                      <button
                        className="qty-btn"
                        onClick={() => handleQtyChange(item.id, item.qty + 1)}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div className="item-subtotal-info">
                      <span className="subtotal-label">Subtotal:</span>
                      <span className="subtotal-val">₹{(item.price * item.qty).toFixed(2)}</span>
                    </div>

                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
                      title="Remove Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Sidebar */}
            <div className="cart-summary-sidebar">
              <div className="summary-card">
                <h3 className="summary-title">Order Summary</h3>
                
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

                {deliveryCharge > 0 && (
                  <p className="delivery-tip">
                    Add <strong>₹{(500 - subtotal).toFixed(2)}</strong> more for FREE delivery!
                  </p>
                )}

                <div className="summary-row">
                  <span>Tax (8%)</span>
                  <strong>₹{tax.toFixed(2)}</strong>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row total-row">
                  <span>Grand Total</span>
                  <span className="grand-total-val">₹{total.toFixed(2)}</span>
                </div>

                <button
                  className="neo-btn primary checkout-btn"
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
