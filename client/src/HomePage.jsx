import { useState, useEffect, useRef, useContext } from 'react';
import { CartContext } from './context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Heart, Search, X, Plus, Minus, Star, Clock,
  LogIn, User, FileText,
  Home as HomeIcon, Package, Zap, Sparkles, Wand2,
  Trash2
} from 'lucide-react';
import SearchBar from './SearchBar';
import { PRODUCTS } from './data/products';
import DeliveryBadge from './components/DeliveryBadge';
import PincodeChecker from './components/PincodeChecker';

const CATEGORIES = ['All', 'Wands', 'Carts', 'Inkwells', 'Cloaks', 'Timepieces', 'Magic Tech', 'Gift Sets'];

const HERO_SLIDES = [
  {
    id: 1,
    bg: 'linear-gradient(135deg, #0a0a0f 0%, #1a0a0a 50%, #0f0005 100%)',
    headline: '🩸 BLOOD MOON SALE',
    subtext: 'Enchanted artifacts forged in darkness',
    cta: 'SHOP NOW →',
    ctaClass: 'cta-crimson',
    floatEl: <span className="hero-float-elem moon-float" aria-hidden="true">🌕</span>,
  },
  {
    id: 2,
    bg: 'linear-gradient(135deg, #0a0a0f 0%, #0a001a 50%, #120010 100%)',
    headline: '⚡ FORBIDDEN COLLECTION',
    subtext: '50% off — Cursed items, limited stock',
    cta: 'GRAB THE DEAL',
    ctaClass: 'cta-purple',
    floatEl: (
      <>
        <span className="hero-float-elem sparkle-float" style={{ top:'15%', left:'10%', animationDuration:'3s' }} aria-hidden="true">✨</span>
        <span className="hero-float-elem sparkle-float" style={{ top:'25%', right:'12%', animationDuration:'4s', animationDelay:'1s' }} aria-hidden="true">⚗️</span>
        <span className="hero-float-elem sparkle-float" style={{ bottom:'20%', left:'8%', animationDuration:'5s', animationDelay:'0.5s' }} aria-hidden="true">✨</span>
      </>
    ),
  },
  {
    id: 3,
    bg: 'linear-gradient(135deg, #0a0a0f 0%, #001a1a 50%, #000f12 100%)',
    headline: '🌙 MIDNIGHT DISPATCH',
    subtext: 'Order before midnight, arrive by dawn',
    cta: 'EXPLORE',
    ctaClass: 'cta-gold',
    floatEl: (
      <>
        <span className="hero-float-elem bat-fly" style={{ top:'30%', animationDuration:'8s' }} aria-hidden="true">🦇</span>
        <span className="hero-float-elem bat-fly" style={{ top:'55%', animationDuration:'11s', animationDelay:'3s' }} aria-hidden="true">🦇</span>
      </>
    ),
  },
];

const DEAL_PRODUCTS = PRODUCTS.filter(p => p.discount >= 20).slice(0, 4);

function CountdownTimer() {
  const [time, setTime] = useState(() => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    const diff = Math.floor((end - now) / 1000);
    return { hours: Math.floor(diff / 3600), minutes: Math.floor((diff % 3600) / 60), seconds: diff % 60 };
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      const diff = Math.floor((end - now) / 1000);
      if (diff <= 0) {
        setTime({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTime({ hours: Math.floor(diff / 3600), minutes: Math.floor((diff % 3600) / 60), seconds: diff % 60 });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="countdown-timer">
      <Clock size={14} />
      <span>{String(time.hours).padStart(2, '0')}:{String(time.minutes).padStart(2, '0')}:{String(time.seconds).padStart(2, '0')}</span>
    </div>
  );
}

export default function HomePage({ user, onLogout }) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [quickView, setQuickView] = useState(null);
  const [quickViewQty, setQuickViewQty] = useState(1);
  const { cart, addToCart, removeFromCart } = useContext(CartContext);
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wizago_wishlist')) || []; }
    catch { return []; }
  });
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [showWishlistDropdown, setShowWishlistDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const slideInterval = useRef(null);

// Cart persistence is handled globally by CartContext

  useEffect(() => {
    localStorage.setItem('wizago_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    slideInterval.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 4000);
    return () => clearInterval(slideInterval.current);
  }, []);

  const filteredProducts = PRODUCTS.filter(p =>
    (activeCategory === 'All' || p.category === activeCategory) &&
    (searchQuery === '' || p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSearch = (q) => {
    setSearchQuery(q);
  };

// Local cart methods replaced by global context actions

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      if (prev.some(item => item.id === product.id)) {
        return prev.filter(item => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <div className="home-page">
      {/* HOME NAVBAR */}
      <header className="home-header">
        <div className="home-header-inner">
          <div className="home-logo" onClick={() => navigate('/')}>
            <Wand2 size={20} />
            <span>Wizago Shop</span>
          </div>

          <div className="home-nav-links">
            <Link to="/" className="home-nav-link active">
              <HomeIcon size={14} /> Home
            </Link>
            <Link to="/orders" className="home-nav-link">
              <Package size={14} /> Orders
            </Link>
            <Link to="/cart" className="home-nav-link">
              <ShoppingCart size={14} /> Cart
            </Link>
            {user && user.role === 'vendor' && (
              <Link to="/vendor/dashboard" className="home-nav-link">
                <FileText size={14} /> Vendor Dashboard
              </Link>
            )}
          </div>

          <div className="home-header-right">
            {/* Cart */}
            <div className="home-icon-btn" onClick={() => { setShowCartDropdown(!showCartDropdown); setShowWishlistDropdown(false); }}>
              <ShoppingCart size={18} />
              {cartCount > 0 && <span className="home-badge">{cartCount}</span>}
              {showCartDropdown && (
                <>
                  <div className="home-dropdown-backdrop" onClick={() => setShowCartDropdown(false)} />
                  <div className="home-dropdown home-cart-dropdown" onClick={e => e.stopPropagation()}>
                    <div className="home-dropdown-header">Cart ({cart.length})</div>
                    {cart.length === 0 ? (
                      <div className="home-dropdown-empty">Your cart is empty</div>
                    ) : (
                      <div className="home-cart-items">
                        {cart.map(item => (
                          <div key={item.id} className="home-cart-item">
                            <div className="home-cart-item-info">
                              <strong>{item.name}</strong>
                              <span>₹{item.price.toFixed(2)} x {item.qty}</span>
                            </div>
                            <button className="home-cart-remove" onClick={() => removeFromCart(item.id)}>
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="home-dropdown-footer">
                      <button className="neo-btn neo-btn-sm primary" onClick={() => navigate('/cart')}>
                        View Cart
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Wishlist */}
            <div className="home-icon-btn" onClick={() => { setShowWishlistDropdown(!showWishlistDropdown); setShowCartDropdown(false); }}>
              <Heart size={18} />
              {wishlist.length > 0 && <span className="home-badge">{wishlist.length}</span>}
              {showWishlistDropdown && (
                <>
                  <div className="home-dropdown-backdrop" onClick={() => setShowWishlistDropdown(false)} />
                  <div className="home-dropdown home-cart-dropdown" onClick={e => e.stopPropagation()}>
                    <div className="home-dropdown-header">Wishlist ({wishlist.length})</div>
                    {wishlist.length === 0 ? (
                      <div className="home-dropdown-empty">Your wishlist is empty</div>
                    ) : (
                      <div className="home-cart-items">
                        {wishlist.map(item => (
                          <div key={item.id} className="home-cart-item">
                            <div className="home-cart-item-info">
                              <strong>{item.name}</strong>
                              <span>₹{item.price.toFixed(2)}</span>
                            </div>
                            <button className="home-cart-remove" onClick={() => toggleWishlist(item)}>
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* User */}
            {user ? (
              <div className="home-user-btn" onClick={() => {
                if (window.confirm('Sign out?')) onLogout();
              }}>
                <User size={16} />
                <span>{user.name}</span>
              </div>
            ) : (
              <button className="neo-btn neo-btn-sm" onClick={() => navigate('/login')}>
                <LogIn size={12} /> Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* HERO BANNER */}
      <section className="hero-banner" aria-label="Promotional banners">
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ background: slide.bg }}
          >
            {slide.floatEl}
            <div className="hero-slide-content">
              <h2>{slide.headline}</h2>
              <p>{slide.subtext}</p>
              <button className={`hero-cta ${slide.ctaClass}`}>
                {slide.cta}
              </button>
            </div>
          </div>
        ))}
        <div className="hero-dots">
          {HERO_SLIDES.map((_, index) => (
            <button
              key={index}
              className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* SEARCH BAR */}
      <div className="home-search-section">
        <SearchBar
          onSearch={handleSearch}
          onProductClick={(product) => {
            setQuickView(product);
            setQuickViewQty(1);
          }}
          placeholder="Search wands, carts, products..."
        />
      </div>

      {/* CATEGORY CHIPS */}
      <section className="category-chips-section">
        <div className="category-chips">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`category-chip ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* DEALS OF THE DAY */}
      <section className="deals-section">
        <div className="section-header">
          <div className="section-title">
            <Zap size={18} />
            <h2>Deals of the Day</h2>
          </div>
          <CountdownTimer />
        </div>
        <div className="deals-grid">
          {DEAL_PRODUCTS.map(product => (
            <div key={product.id} className="deal-card">
              <div className="deal-card-badge">-{product.discount}%</div>
              <div className="product-card-image deal-image">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : (
                  <div className="img-fallback" style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", background: "linear-gradient(135deg, #0f0f1a, #1a0a1a)" }}>
                    {product.name.charAt(0)}
                  </div>
                )}
              </div>
              <h4>{product.name}</h4>
              <div className="deal-prices">
                <span className="deal-original">₹{product.originalPrice.toFixed(2)}</span>
                <span className="deal-price">₹{product.price.toFixed(2)}</span>
              </div>
              <button className="neo-btn neo-btn-sm primary add-cart-btn" onClick={() => addToCart(product)}>
                <ShoppingCart size={12} /> Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section className="products-section">
        <div className="section-header">
          <div className="section-title">
            <Sparkles size={18} />
            <h2>{activeCategory === 'All' ? 'All Artifacts' : activeCategory}</h2>
          </div>
          <span className="products-count">{filteredProducts.length} items</span>
        </div>
        <div className="product-grid">
          {filteredProducts.map(product => {
            const inWishlist = wishlist.some(w => w.id === product.id);
            return (
              <div key={product.id} className="product-card" onClick={() => { setQuickView(product); setQuickViewQty(1); }}>
                <button
                  className={`product-wishlist-btn ${inWishlist ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                >
                  <Heart size={16} fill={inWishlist ? '#ff3f6c' : 'none'} />
                </button>
                {product.discount > 0 && (
                  <span className="product-discount-badge">-{product.discount}%</span>
                )}
                <div className="product-card-image">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px" }}
                      onError={(e) => {
                        e.target.style.display = "none";
                        const fallback = e.target.parentElement?.querySelector('.img-fallback');
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div className="img-fallback" style={{
                    width: "100%", height: "200px", display: product.image ? "none" : "flex",
                    alignItems: "center", justifyContent: "center",
                    background: "linear-gradient(135deg, #0f0f1a, #1a0a1a)", borderRadius: "8px"
                  }}>
                    {product.name.charAt(0)}
                  </div>
                </div>
                <div className="product-card-body">
                  <span className="product-category-badge">{product.category}</span>
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-rating">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star
                        key={i}
                        size={12}
                        fill={i <= Math.round(product.rating) ? '#f5c400' : 'none'}
                        color={i <= Math.round(product.rating) ? '#f5c400' : '#d4d5d9'}
                      />
                    ))}
                    <span className="product-rating-text">{product.rating}</span>
                  </div>
                  <div className="product-prices">
                    <span className="product-price">₹{product.price.toFixed(2)}</span>
                    {product.originalPrice > product.price && (
                      <span className="product-original-price">₹{product.originalPrice.toFixed(2)}</span>
                    )}
                  </div>
                  <div style={{ margin: '0.25rem 0' }}>
                    <DeliveryBadge product={product} cartTotal={cart.reduce((a, i) => a + i.price * i.qty, 0)} />
                  </div>
                  <button
                    className="neo-btn neo-btn-sm primary add-cart-btn"
                    onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                  >
                    <ShoppingCart size={12} /> Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {filteredProducts.length === 0 && (
          <div className="empty-state" style={{ marginTop: '2rem' }}>
            <Search size={24} />
            <p>No artifacts found. Try a different search or category.</p>
          </div>
        )}
      </section>

      {/* QUICK VIEW MODAL */}
      {quickView && (
        <div className="popup-overlay" onClick={() => setQuickView(null)}>
          <div className="quick-view-modal" onClick={e => e.stopPropagation()}>
            <button className="quick-view-close" onClick={() => setQuickView(null)}>
              <X size={18} />
            </button>
            <div className="quick-view-content">
              <div className="quick-view-image">
                {quickView.image ? (
                  <img
                    src={quickView.image}
                    alt={quickView.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      const fb = e.target.parentElement?.querySelector('.qv-fallback');
                      if (fb) fb.style.display = "flex";
                    }}
                  />
                ) : null}
                <div className="qv-fallback" style={{
                  width: "100%", height: "100%", display: quickView.image ? "none" : "flex",
                  alignItems: "center", justifyContent: "center",
                  background: "linear-gradient(135deg, #0f0f1a, #1a0a1a)", borderRadius: "8px"
                }}>
                  {quickView.name.charAt(0)}
                </div>
              </div>
              <div className="quick-view-details">
                <span className="product-category-badge">{quickView.category}</span>
                <h2>{quickView.name}</h2>
                <div className="product-rating" style={{ margin: '0.5rem 0' }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star
                      key={i}
                      size={16}
                      fill={i <= Math.round(quickView.rating) ? '#f5c400' : 'none'}
                      color={i <= Math.round(quickView.rating) ? '#f5c400' : '#d4d5d9'}
                    />
                  ))}
                  <span className="product-rating-text" style={{ fontSize: '0.9rem' }}>{quickView.rating}</span>
                </div>
                <div className="quick-view-prices">
                  <span className="product-price" style={{ fontSize: '1.5rem' }}>₹{quickView.price.toFixed(2)}</span>
                  {quickView.originalPrice > quickView.price && (
                    <span className="product-original-price" style={{ fontSize: '1rem' }}>₹{quickView.originalPrice.toFixed(2)}</span>
                  )}
                  {quickView.discount > 0 && (
                    <span className="deal-card-badge" style={{ position: 'static', display: 'inline-block', marginLeft: '0.5rem' }}>Save {quickView.discount}%</span>
                  )}
                </div>
                <p className="quick-view-desc">
                  A fine {quickView.name.toLowerCase()} from the Wizago collection. 
                  Hand-crafted with the finest magical materials. Perfect for everyday spellcasting and potion brewing.
                </p>
                <div className="quick-view-qty">
                  <label>Quantity:</label>
                  <div className="qty-controls">
                    <button onClick={() => setQuickViewQty(Math.max(1, quickViewQty - 1))}><Minus size={14} /></button>
                    <span>{quickViewQty}</span>
                    <button onClick={() => setQuickViewQty(quickViewQty + 1)}><Plus size={14} /></button>
                  </div>
                </div>
                <div className="quick-view-actions">
                  <button className="neo-btn primary" onClick={() => { addToCart(quickView, quickViewQty); setQuickView(null); }}>
                    <ShoppingCart size={14} /> Add to Cart
                  </button>
                  <button className="neo-btn success" onClick={() => { addToCart(quickView, quickViewQty); navigate('/pos'); }}>
                    Buy Now
                  </button>
                </div>
                <div style={{ marginTop: '1rem', borderTop: '1px solid #2d2d4f', paddingTop: '1rem' }}>
                  <PincodeChecker compact />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="home-footer-inner">
          <div className="footer-column">
            <div className="home-logo" style={{ marginBottom: '0.5rem' }}>
              <Wand2 size={18} />
              <span>Wizago Shop</span>
            </div>
            <p className="footer-tagline">
              Spells, Curios & Magical Supplies. Serving witches and wizards since ancient times.
            </p>
          </div>
          <div className="footer-column">
            <h4>Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/">Products</Link>
            <Link to="/pos">Orders</Link>
            <Link to="/">Contact</Link>
          </div>
          <div className="footer-column">
            <h4>Accepted Payments</h4>
            <div className="footer-payments">
              <span className="payment-icon">💳</span>
              <span className="payment-icon">📱</span>
              <span className="payment-icon">💰</span>
              <span className="payment-icon">🪄</span>
            </div>
            <p className="footer-payment-text">Credit Card, UPI, Wallet, Magical Coins</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Wizago Shop. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
