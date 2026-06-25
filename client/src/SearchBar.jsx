import { useState, useRef, useEffect, useContext } from 'react';
import { Search, Clock, X } from 'lucide-react';
import { PRODUCTS } from './HomePage';
import { CartContext } from './context/CartContext';

const HISTORY_KEY = 'wizago_search_history';
const MAX_HISTORY = 8;

export default function SearchBar({ onSearch, onProductClick, placeholder = 'Search products...' }) {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
    catch { return []; }
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const addToHistory = (term) => {
    if (!term.trim()) return;
    const next = [term, ...history.filter(h => h !== term)].slice(0, MAX_HISTORY);
    setHistory(next);
  };

  const removeFromHistory = (term, e) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(h => h !== term));
  };

  const clearHistory = (e) => {
    e.stopPropagation();
    setHistory([]);
    setShowDropdown(false);
  };

  const handleSubmit = (term) => {
    const t = term || query;
    if (!t.trim()) return;
    addToHistory(t);
    onSearch(t);
    setShowDropdown(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  // Filter matching products from catalog (case insensitive, up to 8 matches)
  const queryClean = query.trim().toLowerCase();
  const matchingProducts = queryClean.length >= 2
    ? PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(queryClean) ||
        p.category.toLowerCase().includes(queryClean)
      ).slice(0, 8)
    : [];

  const highlightText = (text, highlight) => {
    if (!highlight.trim()) return text;
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          style={{
            backgroundColor: '#f5c400',
            color: '#000',
            padding: '0 2px',
            borderRadius: '2px',
            fontWeight: 'bold'
          }}
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const handleProductClick = (product, e) => {
    if (e.target.closest('.search-result-add-btn')) return;
    if (onProductClick) {
      onProductClick(product);
      setShowDropdown(false);
    }
  };

  return (
    <div className="search-bar-wrapper" ref={wrapperRef}>
      <div className="search-bar-input-group">
        <Search size={16} className="search-bar-icon" />
        <input
          type="text"
          className="search-bar-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
        />
        {query && (
          <button className="search-bar-clear" onClick={() => { setQuery(''); onSearch(''); }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Floating dropdown when query >= 2 characters */}
      {showDropdown && query.trim().length >= 2 && (
        <div className="search-live-dropdown">
          <div className="search-results-list text-left">
            {matchingProducts.length === 0 ? (
              <div className="search-no-results">
                No products found for '{query}'
              </div>
            ) : (
              matchingProducts.map(product => (
                <div
                  key={product.id}
                  className="search-result-row"
                  onClick={(e) => handleProductClick(product, e)}
                >
                  <div className="search-result-img">
                    {product.name.charAt(0)}
                  </div>
                  <div className="search-result-info">
                    <span className="search-result-name">
                      {highlightText(product.name, query)}
                    </span>
                    <span className="search-result-category">
                      {product.category}
                    </span>
                  </div>
                  <div className="search-result-pricing">
                    {product.originalPrice > product.price && (
                      <span className="search-result-original">
                        ₹{product.originalPrice.toFixed(2)}
                      </span>
                    )}
                    <span className="search-result-price">
                      ₹{product.price.toFixed(2)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="search-result-add-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product, 1);
                    }}
                  >
                    ADD
                  </button>
                </div>
              ))
            )}
          </div>

          {/* History list inside live search dropdown, limited to last 5 items */}
          {history.length > 0 && (
            <div className="search-history-section" style={{ borderTop: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
              <div className="search-history-header" style={{ borderBottom: 'none', padding: '0.4rem 0.75rem' }}>
                <span>Recent searches</span>
              </div>
              {history.slice(0, 5).map((term) => (
                <div
                  key={term}
                  className="search-history-item"
                  onClick={() => { setQuery(term); handleSubmit(term); }}
                  style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                >
                  <Clock size={12} className="search-history-icon" style={{ color: 'var(--text-muted)' }} />
                  <span className="search-history-term" style={{ marginLeft: '0.4rem', flex: 1, fontSize: '0.8rem' }}>{term}</span>
                  <button
                    className="search-history-remove"
                    onClick={(e) => removeFromHistory(term, e)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legacy Search History Dropdown when query < 2 characters */}
      {showDropdown && query.trim().length < 2 && history.length > 0 && (
        <div className="search-history-dropdown">
          <div className="search-history-header">
            <span>Recent searches</span>
          </div>
          {history.map((term) => (
            <div
              key={term}
              className="search-history-item"
              onClick={() => { setQuery(term); handleSubmit(term); }}
            >
              <Clock size={14} className="search-history-icon" />
              <span className="search-history-term">{term}</span>
              <button
                className="search-history-remove"
                onClick={(e) => removeFromHistory(term, e)}
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <div className="search-history-footer" onClick={clearHistory}>
            Clear all history
          </div>
        </div>
      )}
    </div>
  );
}
