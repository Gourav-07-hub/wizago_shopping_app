import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from './context/CartContext';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Star, X } from 'lucide-react';
import { PRODUCTS } from './data/products';
import './CartPage.css';

export default function CartPage() {
  const { cart, updateQty, removeFromCart, addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [quickView, setQuickView] = useState(null);
  const [quickViewQty, setQuickViewQty] = useState(1);
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const deliveryCharge = subtotal >= 500 || subtotal === 0 ? 0 : 40;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryCharge + tax;

  const handleQtyChange = (id, newQty) => {
    updateQty(id, newQty);
  };

  useEffect(() => {
    const cartItemIds = new Set(cart.map(item => item.id));
    const eligibleProducts = PRODUCTS.filter(prod => !cartItemIds.has(prod.id));
    const shuffled = [...eligibleProducts].sort(() => 0.5 - Math.random());
    /* eslint-disable react-hooks/set-state-in-effect */
    setRecommendedProducts(shuffled.slice(0, 4));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [cart]);

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
            {/* Left Column (Items + Suggestions) */}
            <div className="cart-left-col">
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

              {/* YOU MIGHT ALSO LIKE SECTION */}
              {recommendedProducts.length > 0 && (
                <div className="you-might-like-section">
                  <h2 className="you-might-like-heading">
                    You Might Also Like
                  </h2>
                  <div className="you-might-like-row no-scrollbar">
                    {recommendedProducts.map((prod) => (
                      <div
                        key={prod.id}
                        className="mini-product-card"
                        onClick={() => {
                          setQuickView(prod);
                          setQuickViewQty(1);
                        }}
                      >
                        <div className="mini-product-card-image-area">
                          <span className="mini-product-card-letter">
                            {prod.name.charAt(0)}
                          </span>
                        </div>
                        <h4 className="mini-product-card-name">{prod.name}</h4>
                        <p className="mini-product-card-price">₹{prod.price.toFixed(2)}</p>
                        <button
                          className="mini-product-card-add-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(prod, 1);
                          }}
                        >
                          ADD
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

      {/* QUICK VIEW POPUP MODAL */}
      {quickView && (
        <div className="popup-overlay" onClick={() => setQuickView(null)}>
          <div className="quick-view-modal" onClick={(e) => e.stopPropagation()}>
            <button className="quick-view-close" onClick={() => setQuickView(null)}>
              <X size={20} />
            </button>
            <div className="quick-view-grid">
              <div className="quick-view-image-panel">
                {quickView.image ? (
                  <img
                    src={quickView.image}
                    alt={quickView.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      const fallback = e.target.parentElement?.querySelector('.img-fallback');
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                ) : null}
                <div className="img-fallback" style={{
                  display: quickView.image ? "none" : "flex",
                  width: "100%", height: "100%",
                  alignItems: "center", justifyContent: "center",
                  background: "linear-gradient(135deg, #0f0f1a, #1a0a1a)", borderRadius: "8px",
                  fontSize: "3rem", fontWeight: "bold"
                }}>
                  {quickView.name.charAt(0)}
                </div>
              </div>
              <div className="quick-view-info-panel">
                <span className="product-category-badge">{quickView.category}</span>
                <h2>{quickView.name}</h2>
                <div className="product-rating" style={{ margin: '0.5rem 0' }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star
                      key={i}
                      size={14}
                      fill={i <= Math.round(quickView.rating) ? '#f5c400' : 'none'}
                      color={i <= Math.round(quickView.rating) ? '#f5c400' : '#d4d5d9'}
                    />
                  ))}
                  <span className="product-rating-text" style={{ fontSize: '0.9rem', marginLeft: '0.5rem', color: 'var(--color-mist)' }}>{quickView.rating}</span>
                </div>
                <div className="quick-view-price-section">
                  <span className="product-price" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f5c400' }}>₹{quickView.price.toFixed(2)}</span>
                  {quickView.originalPrice > quickView.price && (
                    <span className="product-original-price" style={{ fontSize: '1rem', textDecoration: 'line-through', color: 'rgba(255,255,255,0.4)', marginLeft: '0.5rem' }}>₹{quickView.originalPrice.toFixed(2)}</span>
                  )}
                  {quickView.discount > 0 && (
                    <span className="deal-card-badge" style={{ position: 'static', display: 'inline-block', marginLeft: '0.5rem', background: '#dc143c', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>Save {quickView.discount}%</span>
                  )}
                </div>
                <p style={{ margin: '1rem 0', color: 'var(--color-mist)', lineHeight: '1.6' }}>
                  A fine {quickView.name.toLowerCase()} from the Wizago collection. 
                  Hand-crafted, authenticated, and ready to serve your needs.
                </p>
                <div className="quick-view-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                  <div className="qty-controls" style={{ border: '1px solid rgba(255,255,255,0.2)', padding: '4px' }}>
                    <button onClick={() => setQuickViewQty(Math.max(1, quickViewQty - 1))} className="qty-btn"><Minus size={14} /></button>
                    <span className="qty-val" style={{ margin: '0 10px' }}>{quickViewQty}</span>
                    <button onClick={() => setQuickViewQty(quickViewQty + 1)} className="qty-btn"><Plus size={14} /></button>
                  </div>
                  <button className="neo-btn primary" onClick={() => { addToCart(quickView, quickViewQty); setQuickView(null); }} style={{ padding: '10px 20px', border: 'none', background: 'linear-gradient(135deg, #8b0000, #dc143c)', color: 'white', cursor: 'pointer', fontFamily: 'Cinzel Decorative' }}>
                    ADD TO CART
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
