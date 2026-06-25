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

// ---- PRODUCT CATALOG ----
export const PRODUCTS = [
  { id: 1, name: 'Elder Wood Wand', category: 'Wands', price: 59.99, originalPrice: 79.99, rating: 4.5, discount: 25, image: null },
  { id: 2, name: 'Phoenix Feather Wand', category: 'Wands', price: 89.99, originalPrice: 119.99, rating: 4.8, discount: 25, image: null },
  { id: 3, name: 'Unicorn Hair Wand', category: 'Wands', price: 74.99, originalPrice: 89.99, rating: 4.6, discount: 17, image: null },
  { id: 4, name: 'Dragon Heartstring Wand', category: 'Wands', price: 99.99, originalPrice: 129.99, rating: 4.9, discount: 23, image: null },
  { id: 5, name: 'Self-Stirring Pewter Cart', category: 'Carts', price: 120.00, originalPrice: 150.00, rating: 4.3, discount: 20, image: null },
  { id: 6, name: 'Brass Pocket Cart', category: 'Carts', price: 45.00, originalPrice: 55.00, rating: 4.1, discount: 18, image: null },
  { id: 7, name: 'Iron Brewing Cart XL', category: 'Carts', price: 199.99, originalPrice: 249.99, rating: 4.7, discount: 20, image: null },
  { id: 8, name: 'Golden Stirring Cart', category: 'Carts', price: 159.99, originalPrice: 189.99, rating: 4.4, discount: 16, image: null },
  { id: 9, name: 'Anti-Gravity Floating Inkwell', category: 'Inkwells', price: 29.99, originalPrice: 39.99, rating: 4.2, discount: 25, image: null },
  { id: 10, name: 'Silver Raven Inkwell Set', category: 'Inkwells', price: 49.99, originalPrice: 64.99, rating: 4.5, discount: 23, image: null },
  { id: 11, name: 'Crystal Clear Inkwell', category: 'Inkwells', price: 19.99, originalPrice: 24.99, rating: 3.8, discount: 20, image: null },
  { id: 12, name: 'Enchanted Self-Filling Inkwell', category: 'Inkwells', price: 39.99, originalPrice: 49.99, rating: 4.6, discount: 20, image: null },
  { id: 13, name: 'Midnight Velvet Wizard Cloak', category: 'Cloaks', price: 95.00, originalPrice: 125.00, rating: 4.7, discount: 24, image: null },
  { id: 14, name: 'Crimson Sorcerer Robe', category: 'Cloaks', price: 129.99, originalPrice: 169.99, rating: 4.5, discount: 24, image: null },
  { id: 15, name: 'Invisibility Shawl', category: 'Cloaks', price: 199.99, originalPrice: 249.99, rating: 4.9, discount: 20, image: null },
  { id: 16, name: 'Silver Star Travel Cloak', category: 'Cloaks', price: 79.99, originalPrice: 99.99, rating: 4.3, discount: 20, image: null },
  { id: 17, name: 'Chrono-Watch Timepiece', category: 'Timepieces', price: 249.99, originalPrice: 299.99, rating: 4.8, discount: 17, image: null },
  { id: 18, name: 'Sand Timer of Ages', category: 'Timepieces', price: 89.99, originalPrice: 119.99, rating: 4.4, discount: 25, image: null },
  { id: 19, name: 'Moon Phase Pocket Watch', category: 'Timepieces', price: 149.99, originalPrice: 189.99, rating: 4.6, discount: 21, image: null },
  { id: 20, name: 'Crystal Hourglass', category: 'Timepieces', price: 59.99, originalPrice: 74.99, rating: 4.2, discount: 20, image: null },
  { id: 21, name: 'Glow-in-the-dark Spark Wand', category: 'Magic Tech', price: 45.00, originalPrice: 55.00, rating: 4.0, discount: 18, image: null },
  { id: 22, name: 'Auto-Quill Enchanted Pen', category: 'Magic Tech', price: 34.99, originalPrice: 44.99, rating: 4.3, discount: 22, image: null },
  { id: 23, name: 'Floating Orb Lantern', category: 'Magic Tech', price: 69.99, originalPrice: 89.99, rating: 4.5, discount: 22, image: null },
  { id: 24, name: 'Talking Sorting Hat', category: 'Magic Tech', price: 149.99, originalPrice: 179.99, rating: 4.7, discount: 17, image: null },
  { id: 25, name: 'Premium Gift Box - Wand Set', category: 'Gift Sets', price: 129.99, originalPrice: 169.99, rating: 4.8, discount: 24, image: null },
  { id: 26, name: 'Starter Wizard Kit', category: 'Gift Sets', price: 79.99, originalPrice: 99.99, rating: 4.4, discount: 20, image: null },
  { id: 27, name: 'Luxury Potion Master Set', category: 'Gift Sets', price: 199.99, originalPrice: 259.99, rating: 4.9, discount: 23, image: null },
  { id: 28, name: 'Spellbook & Artifact Collection', category: 'Gift Sets', price: 159.99, originalPrice: 199.99, rating: 4.6, discount: 20, image: null },
];

const CATEGORIES = ['All', 'Wands', 'Carts', 'Inkwells', 'Cloaks', 'Timepieces', 'Magic Tech', 'Gift Sets'];

const HERO_SLIDES = [
  { id: 1, bg: '#1a1a2e', headline: 'New Arrivals — Enchanted Wands', subtext: 'Discover wands crafted from rare magical cores', cta: 'Shop Now', color: '#f5c400' },
  { id: 2, bg: '#2d1b3d', headline: '50% Off — Cart Collection', subtext: 'Brew potions in style with our premium carts', cta: 'Grab the Deal', color: '#e94560' },
  { id: 3, bg: '#0f3460', headline: 'Premium Gift Boxes — Free Shipping', subtext: 'Perfect for every witch and wizard in your circle', cta: 'Explore', color: '#16c79a' },
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
      <section className="hero-banner">
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ background: slide.bg }}
          >
            <div className="hero-slide-content">
              <h2>{slide.headline}</h2>
              <p>{slide.subtext}</p>
              <button className="hero-cta" style={{ background: slide.color }}>
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
                {product.name.charAt(0)}
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
                  {product.name.charAt(0)}
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
                {quickView.name.charAt(0)}
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
