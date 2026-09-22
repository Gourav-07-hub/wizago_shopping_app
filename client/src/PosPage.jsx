import { useState, useEffect, useRef, useContext } from 'react';
import { CartContext } from './context/CartContext';
import {
  Trash2,
  Layers, ShoppingBag, FileText,
  UserPlus, Save, X, PlusCircle, Database, Lock, Check,
  ArrowUp, Eye, LogIn, Mail, User, Home
} from 'lucide-react';
import { api } from './api';
import SearchBar from './SearchBar';
import ReceiptPanel from './ReceiptPanel';
import { useNavigate } from 'react-router-dom';

const MOCK_EMPLOYEES = [];

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY || '';

const QUICK_PRODUCTS = [
  { name: 'Glow-in-the-dark Spark Wand', category: 'Accessories', price: 45.00, tax: 8, discount: 5 },
  { name: 'Self-Stirring Pewter Cart', category: 'Furniture', price: 120.00, tax: 10, discount: 10 },
  { name: 'Anti-Gravity Floating Inkwell', category: 'Office Supplies', price: 29.99, tax: 5, discount: 0 },
  { name: 'Midnight Velvet Wizard Cloak', category: 'Apparel', price: 95.00, tax: 6, discount: 15 },
  { name: 'Chrono-Watch Timepiece', category: 'Electronics', price: 249.99, tax: 12, discount: 20 },
];

const PACKAGING_OPTIONS = {
  polybag: { name: 'Standard Polybag', price: 1.50, desc: 'Lightweight waterproof sleeve' },
  ecobox: { name: 'Cardboard Eco-Box', price: 3.00, desc: '100% recycled biodegradable material' },
  giftbox: { name: 'Premium Gift Box', price: 6.00, desc: 'Rigid box with ribbon & card' },
  woodcrate: { name: 'Heavy-Duty Wood Crate', price: 12.00, desc: 'Custom reinforced timber frame' },
};

const SHIPPING_METHODS = {
  standard: { name: 'Standard Ground Owl', price: 0.00, desc: 'Delivery in 3-5 business days' },
  express: { name: 'Express Hippogriff', price: 5.00, desc: 'Delivery in 1-2 business days' },
  overnight: { name: 'Phoenix Air Express', price: 15.00, desc: 'Guaranteed delivery next morning' },
};

const STATES = [
  'Russia', 'India', 'pakistan', 'germany', 'USA', 'japan', 'spain', 'argentina',
];

export default function PosPage({ user, onLogout }) {
  const navigate = useNavigate();

  // --- Employee State ---
  const [employees, setEmployees] = useState(MOCK_EMPLOYEES);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newEmployeeMode, setNewEmployeeMode] = useState(false);
  const [newEmpData, setNewEmpData] = useState({ id: '', name: '', dept: '', role: '' });

  // --- Product State ---
  const [productForm, setProductForm] = useState({
    name: '', category: 'Electronics', price: '', qty: '1', discount: '0', tax: '8'
  });
  const { cart: cartItems, setCart: setCartItems } = useContext(CartContext);

  // --- Shipping State ---
  const [shippingForm, setShippingForm] = useState({
    state: '',
    address: '',
    packagingType: 'polybag',
    deliveryMethod: 'standard',
    notes: ''
  });

  // --- Invoice State ---
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [isCompiled, setIsCompiled] = useState(false);
  const [invoiceLogs, setInvoiceLogs] = useState([]);
  const [showOrdersPopup, setShowOrdersPopup] = useState(false);
  const employeeOrder = employees.map(e => e.id);
  const [editingLogId, setEditingLogId] = useState(null);
  const [editLogData, setEditLogData] = useState({});

  // --- UI State ---
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showProfileSuccess, setShowProfileSuccess] = useState(false);
  const [showReceiptPanel, setShowReceiptPanel] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // --- LOCKED TOOLTIP STATE ---
  const [showLockedTip, setShowLockedTip] = useState({ step2: false, step3: false });
  const idCounter = useRef(100000);

  const resetInvoiceMeta = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    setInvoiceNumber(`INV-${new Date().getFullYear()}-${randomNum}`);
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: '2-digit'
    }) + ' ' + now.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit'
    });
    setInvoiceDate(formattedDate);
    setIsCompiled(false);
  };

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    setInvoiceNumber(`INV-${new Date().getFullYear()}-${randomNum}`);
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: '2-digit'
    }) + ' ' + now.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit'
    });
    setInvoiceDate(formattedDate);
    api.employees.list().then(setEmployees).catch(() => {});
    api.orders.list().then(setInvoiceLogs).catch(() => {});
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const handleEmployeeDropdownChange = (e) => {
    const val = e.target.value;
    if (val === 'new') {
      setNewEmployeeMode(true);
      setSelectedEmployee(null);
      setIsCompiled(false);
    } else if (val === '') {
      setSelectedEmployee(null);
      setNewEmployeeMode(false);
      setIsCompiled(false);
    } else {
      const emp = employees.find((x) => x.id === val);
      setSelectedEmployee(emp || null);
      setNewEmployeeMode(false);
      setIsCompiled(false);
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    if (!newEmpData.name || !newEmpData.id) {
      alert('Please enter Employee ID and Name');
      return;
    }
    const newEmp = {
      id: newEmpData.id.toUpperCase(),
      name: newEmpData.name,
      role: newEmpData.role || 'Warlock',
      dept: newEmpData.dept || 'Spells Control',
      status: 'On Duty'
    };
    try {
      const saved = await api.employees.create(newEmp);
      setEmployees(prev => [saved, ...prev]);
      setSelectedEmployee(saved);
    } catch {
      setEmployees(prev => [newEmp, ...prev]);
      setSelectedEmployee(newEmp);
    }
    setNewEmployeeMode(false);
    setNewEmpData({ id: '', name: '', dept: '', role: '' });
    setIsCompiled(false);
  };

  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm({ ...productForm, [name]: value });
  };

  const addProductToCart = (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    if (!productForm.name || !productForm.price) {
      alert('Please fill out Product Name and Unit Price');
      return;
    }
    const price = parseFloat(productForm.price);
    const qty = parseInt(productForm.qty) || 1;
    const discount = parseFloat(productForm.discount) || 0;
    const tax = parseFloat(productForm.tax) || 0;
    const baseTotal = price * qty;
    const discountAmount = baseTotal * (discount / 100);
    const taxableAmount = baseTotal - discountAmount;
    const taxAmount = taxableAmount * (tax / 100);
    const finalTotal = taxableAmount + taxAmount;
    const newItem = {
      id: idCounter.current++, name: productForm.name, category: productForm.category,
      price, qty, discount, tax, total: finalTotal
    };
    setCartItems([...cartItems, newItem]);
    setProductForm({ name: '', category: 'Electronics', price: '', qty: '1', discount: '0', tax: '8' });
    setIsCompiled(false);
  };

  const quickAddProduct = (prod) => {
    if (!selectedEmployee) return;
    const qty = 1;
    const baseTotal = prod.price * qty;
    const discountAmount = baseTotal * (prod.discount / 100);
    const taxableAmount = baseTotal - discountAmount;
    const taxAmount = taxableAmount * (prod.tax / 100);
    const finalTotal = taxableAmount + taxAmount;
    const newItem = {
      id: idCounter.current++, name: prod.name, category: prod.category,
      price: prod.price, qty, discount: prod.discount, tax: prod.tax, total: finalTotal
    };
    setCartItems([...cartItems, newItem]);
    setIsCompiled(false);
  };

  const removeCartItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
    setIsCompiled(false);
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingForm({ ...shippingForm, [name]: value });
    setIsCompiled(false);
  };

  const handlePackagingSelect = (key) => {
    if (!selectedEmployee) return;
    setShippingForm({ ...shippingForm, packagingType: key });
    setIsCompiled(false);
  };

  const getSubtotal = () => cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const getDiscountTotal = () => cartItems.reduce((acc, item) => {
    const base = item.price * item.qty;
    return acc + (base * (item.discount / 100));
  }, 0);
  const getTaxTotal = () => cartItems.reduce((acc, item) => {
    const base = item.price * item.qty;
    const discounted = base - (base * (item.discount / 100));
    return acc + (discounted * (item.tax / 100));
  }, 0);
  const getSurcharge = () => {
    const packPrice = PACKAGING_OPTIONS[shippingForm.packagingType]?.price || 0;
    const shipPrice = SHIPPING_METHODS[shippingForm.deliveryMethod]?.price || 0;
    return packPrice + shipPrice;
  };
  const getGrandTotal = () => getSubtotal() - getDiscountTotal() + getTaxTotal() + getSurcharge();

  const loadSampleData = () => {
    setSelectedEmployee(employees[0]);
    setNewEmployeeMode(false);
    const sampleCart = [
      { id: 1, name: 'Ultra-Bass Wireless Headphones', category: 'Electronics', price: 89.99, qty: 2, discount: 10, tax: 8, total: 174.94 },
      { id: 2, name: 'Stainless Steel Insulated Flask', category: 'Accessories', price: 24.99, qty: 1, discount: 0, tax: 5, total: 26.24 }
    ];
    setCartItems(sampleCart);
    setShippingForm({ state: 'California', address: '742 Evergreen Terrace, Sector 7G', packagingType: 'ecobox', deliveryMethod: 'express', notes: 'Fragile electronics. Leave at the front doorstep.' });
    setIsCompiled(false);
  };

  const handleCompileInvoice = async (e) => {
    if (e) e.preventDefault();
    if (!selectedEmployee) { alert('Please verify and select a wizard employee first!'); return; }
    if (cartItems.length === 0) { alert('Cannot compile an empty manifest! Add at least one magic artifact.'); return; }
    if (!shippingForm.address.trim()) { alert('Please provide a delivery street address.'); return; }
    setIsCompiled(true);
    const newLog = {
      invoiceNumber, date: invoiceDate, employee: selectedEmployee,
      items: cartItems, itemsCount: cartItems.reduce((acc, item) => acc + item.qty, 0),
      grandTotal: getGrandTotal(), subTotal: getSubtotal(),
      discountTotal: getDiscountTotal(), taxTotal: getTaxTotal(), surcharge: getSurcharge(),
      state: shippingForm.state, address: shippingForm.address,
      packaging: PACKAGING_OPTIONS[shippingForm.packagingType].name,
      packagingType: shippingForm.packagingType, deliveryMethod: shippingForm.deliveryMethod,
      notes: shippingForm.notes,
    };
    api.orders.create(newLog).catch(() => {});
    setInvoiceLogs(prev => [newLog, ...prev]);
    setCartItems([]); // Clear cart upon successful order placement
  };

  const handleClearForm = () => {
    if (window.confirm('Are you sure you want to reset the dispatch station?')) {
      setSelectedEmployee(null); setCartItems([]);
      setShippingForm({ state: '', address: '', packagingType: 'polybag', deliveryMethod: 'standard', notes: '' });
      resetInvoiceMeta();
    }
  };

  const displayedLogs = selectedEmployee
    ? invoiceLogs.filter(log => log.employee.id === selectedEmployee.id)
    : invoiceLogs;

  const getTotalRevenue = () => displayedLogs.reduce((acc, log) => acc + log.grandTotal, 0);
  const isEmployeeSelected = !!selectedEmployee;

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const deleteEmployee = async (id) => {
    const emp = employees.find(e => e.id === id);
    if (!window.confirm(`Remove ${emp?.name || id} from the circle?`)) return;
    api.employees.remove(id).catch(() => {});
    const updated = employees.filter(e => e.id !== id);
    setEmployees(updated);
    if (selectedEmployee?.id === id) { setSelectedEmployee(null); setIsCompiled(false); }
  };

  const startEditLog = (log) => {
    setEditingLogId(log.invoiceNumber);
    setEditLogData({ state: log.state, packaging: log.packaging, notes: log.notes || '' });
  };

  const cancelEditLog = () => { setEditingLogId(null); setEditLogData({}); };

  const handleEditChange = (field, value) => {
    setEditLogData(prev => ({ ...prev, [field]: value }));
  };

  const saveLogEdit = () => {
    if (!editingLogId) return;
    setInvoiceLogs(prev => prev.map(log =>
      log.invoiceNumber === editingLogId ? { ...log, ...editLogData } : log
    ));
    api.orders.update(editingLogId, editLogData).catch(() => {});
    setEditingLogId(null); setEditLogData({});
  };

  // --- SEARCH HANDLER ---
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredProducts([]);
      return;
    }
    const q = query.toLowerCase();
    const allProducts = [...QUICK_PRODUCTS, ...cartItems];
    const results = allProducts.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.price && p.price.toString().includes(q))
    );
    setFilteredProducts(results);
  };

  // -- EditProfileModal --
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="dashboard-header">
        <div className="brand-section">
          <div className="logo-badge">Wizago Shop</div>
          <div className="brand-title">
            <h1>POS Terminal</h1>
            <p>Magical inventory, lightning dispatches, and zero potion spills. Fast and reliable delivery!</p>
          </div>
        </div>

        <div className="stats-bar">
          <button className="neo-btn neo-btn-sm" onClick={() => navigate('/')} title="Home">
            <Home size={14} /> <span>Home</span>
          </button>

          <div className="stat-pill">
            <Layers size={16} />
            <span>COMPILED: <strong>{displayedLogs.length}</strong></span>
          </div>

          {user ? (
            <div className="stat-pill" style={{ gap: '0.4rem', position: 'relative' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }} onClick={() => setShowProfilePopup(prev => !prev)}>
                {user.avatar ? (
                  <img src={user.avatar} alt="" style={{ width: 22, height: 22, border: '2px solid var(--border-color)', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 22, height: 22, border: '2px solid var(--border-color)', background: 'var(--color-yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.65rem' }}>
                    {user.name?.charAt(0)}
                  </div>
                )}
                <span style={{ fontSize: '0.75rem' }}>{user.name}</span>
              </span>
              {showProfilePopup && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 1000 }} onClick={() => setShowProfilePopup(false)} />
                  <div className="profile-popup" onClick={e => e.stopPropagation()}>
                    <button className="profile-popup-close" onClick={() => setShowProfilePopup(false)}><X size={12} /></button>
                    <div className="profile-popup-avatar">
                      {user.avatar ? <img src={user.avatar} alt="" /> : <div className="profile-popup-avatar-letter">{user.name?.charAt(0)}</div>}
                    </div>
                    <div className="profile-popup-name">{user.name}</div>
                    <div className="profile-popup-email">{user.email}</div>
                    <div className="profile-popup-actions">
                      <button className="neo-btn neo-btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { setShowProfilePopup(false); setShowEditProfileModal(true); }}>
                        <UserPlus size={12} /> Edit Details
                      </button>
                      <button className="neo-btn neo-btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { setShowProfilePopup(false); onLogout(); }}>
                        <LogIn size={12} style={{ transform: 'rotate(180deg)' }} /> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button className="neo-btn neo-btn-sm" onClick={() => navigate('/login')}>
              <LogIn size={12} /> <span>Login</span>
            </button>
          )}

          <button className="neo-btn neo-btn-sm success" onClick={() => setShowReceiptPanel(true)}>
            <FileText size={14} /> <span>Receipt</span>
          </button>

          <button className="neo-btn neo-btn-sm info" onClick={loadSampleData} title="Inject test data">
            <Database size={14} /> <span>Load Demo</span>
          </button>
          <button className="neo-btn neo-btn-sm" onClick={handleClearForm} title="Reset station">
            <X size={14} /> <span>Clear</span>
          </button>
        </div>
      </header>

      {/* SEARCH BAR */}
      <div className="pos-search-bar">
        <SearchBar onSearch={handleSearch} placeholder="Search products, categories, prices..." />
      </div>

      {/* SEARCH RESULTS */}
      {searchQuery && filteredProducts.length > 0 && (
        <div className="pos-search-results">
          <h4>Search Results ({filteredProducts.length})</h4>
          <div className="pos-search-results-grid">
            {filteredProducts.map((p, i) => (
              <div key={i} className="pos-search-result-item" onClick={() => { quickAddProduct(p); setSearchQuery(''); setFilteredProducts([]); }}>
                <strong>{p.name}</strong>
                <span>₹{p.price?.toFixed(2)} &middot; {p.category}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MAIN WORKSPACE */}
      <div className="main-workspace main-workspace-dashboard">
        {/* COLUMN 1: Step 1 Staff Verification */}
        <div className="neo-card">
          <div className="neo-card-header">
            <h2 className="neo-card-title">
              <span className="badge yellow">01</span>
              Staff Verification
            </h2>
            <span className="card-badge">Step 1 of 3</span>
          </div>

          {!newEmployeeMode ? (
            <div className="form-group">
              <label htmlFor="emp-dropdown">Select Staff Member</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  id="emp-dropdown" className="neo-select"
                  value={selectedEmployee ? selectedEmployee.id : ''}
                  onChange={handleEmployeeDropdownChange}
                >
                  <option value="">-- Select Staff Member --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.id}) &bull; {emp.role}</option>
                  ))}
                  <option value="new">+ Register New Employee...</option>
                </select>
                <button type="button" className="neo-btn" onClick={() => setNewEmployeeMode(true)} title="Register New Employee">
                  <UserPlus size={16} />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateEmployee}>
              <div className="form-row form-row-2">
                <div className="form-group">
                  <label>Staff ID <span style={{color: 'var(--color-red)'}}>*</span></label>
                  <input type="text" className="neo-input" placeholder="e.g. EMP-106" value={newEmpData.id} onChange={(e) => setNewEmpData({...newEmpData, id: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Caster Name <span style={{color: 'var(--color-red)'}}>*</span></label>
                  <input type="text" className="neo-input" placeholder="e.g. Albus D." value={newEmpData.name} onChange={(e) => setNewEmpData({...newEmpData, name: e.target.value})} required />
                </div>
              </div>
              <div className="form-row form-row-2">
                <div className="form-group">
                  <label>Wizard Circle</label>
                  <input type="text" className="neo-input" placeholder="e.g. Owl Dispatch" value={newEmpData.dept} onChange={(e) => setNewEmpData({...newEmpData, dept: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Spell Title</label>
                  <input type="text" className="neo-input" placeholder="e.g. Junior Caster" value={newEmpData.role} onChange={(e) => setNewEmpData({...newEmpData, role: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="neo-btn primary">Save Circle</button>
                <button type="button" className="neo-btn" onClick={() => setNewEmployeeMode(false)}>Cancel</button>
              </div>
            </form>
          )}

          {selectedEmployee && (
            <div className="employee-active-card" style={{ marginTop: '1.25rem' }}>
              <div className="employee-info-box">
                <div className="employee-avatar">{selectedEmployee.name.split(' ').map(n => n[0]).join('')}</div>
                <div className="employee-text">
                  <span className="employee-name">{selectedEmployee.name}</span>
                  <span className="employee-role">{selectedEmployee.id} &bull; {selectedEmployee.role}</span>
                </div>
              </div>
              <span className="badge green" style={{ padding: '0.25rem 0.5rem' }}>{selectedEmployee.dept}</span>
            </div>
          )}
        </div>

        {/* COLUMN 2: Step 2 Product Registry */}
        <div className={`neo-card ${!isEmployeeSelected ? 'locked-panel' : ''}`} style={{ height: '100%' }}>
          {!isEmployeeSelected && (
            <div
              className="locked-panel-message"
              onMouseEnter={() => setShowLockedTip({ ...showLockedTip, step2: true })}
              onMouseLeave={() => setShowLockedTip({ ...showLockedTip, step2: false })}
            >
              <Lock size={14} /> Step 1 Required
              {showLockedTip.step2 && (
                <div className="locked-tooltip">
                  Complete Staff Verification in Step 1 to unlock this section
                </div>
              )}
            </div>
          )}

          <div className={`neo-card-header ${!isEmployeeSelected ? 'locked-fade' : ''}`}>
            <h2 className="neo-card-title">
              <span className="badge blue">02</span>
              Product Registry
            </h2>
            <span className="card-badge">Step 2 of 3</span>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
              Quick Spell-kits
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {QUICK_PRODUCTS.map((prod, index) => (
                <button key={index} type="button" className="neo-btn neo-btn-sm" style={{ textTransform: 'none', background: '#fafafa', padding: '0.25rem 0.5rem' }} onClick={() => quickAddProduct(prod)} disabled={!isEmployeeSelected}>
                  <PlusCircle size={10} style={{ color: 'var(--color-blue)' }} />
                  <span>{prod.name.split(' ').slice(-1)[0]} (₹{prod.price})</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={addProductToCart} style={{ borderTop: '2px dashed var(--border-color)', paddingTop: '1rem' }}>
            <div className="form-row form-row-custom-1">
              <div className="form-group">
                <label htmlFor="prod-name">Product Name</label>
                <input id="prod-name" type="text" name="name" className="neo-input" placeholder="e.g. Cart" value={productForm.name} onChange={handleProductFormChange} disabled={!isEmployeeSelected} />
              </div>
              <div className="form-group">
                <label htmlFor="prod-cat">Category</label>
                <select id="prod-cat" name="category" className="neo-select" value={productForm.category} onChange={handleProductFormChange} disabled={!isEmployeeSelected}>
                  <option value="Electronics">Magic Tech</option>
                  <option value="Furniture">Witchcraft Furniture</option>
                  <option value="Apparel">Wizard Apparel</option>
                  <option value="Accessories">Caster Accessories</option>
                  <option value="Office Supplies">Wiz-Office Supplies</option>
                </select>
              </div>
            </div>
            <div className="form-row form-row-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              <div className="form-group">
                <label htmlFor="prod-price">Price (₹)</label>
                <input id="prod-price" type="number" step="0.01" name="price" className="neo-input text-right" placeholder="0.00" value={productForm.price} onChange={handleProductFormChange} disabled={!isEmployeeSelected} />
              </div>
              <div className="form-group">
                <label htmlFor="prod-qty">Qty</label>
                <input id="prod-qty" type="number" min="1" name="qty" className="neo-input text-right" value={productForm.qty} onChange={handleProductFormChange} disabled={!isEmployeeSelected} />
              </div>
              <div className="form-group">
                <label htmlFor="prod-disc">Disc%</label>
                <input id="prod-disc" type="number" min="0" max="100" name="discount" className="neo-input text-right" value={productForm.discount} onChange={handleProductFormChange} disabled={!isEmployeeSelected} />
              </div>
              <div className="form-group">
                <label htmlFor="prod-tax">Tax%</label>
                <input id="prod-tax" type="number" min="0" max="100" name="tax" className="neo-input text-right" value={productForm.tax} onChange={handleProductFormChange} disabled={!isEmployeeSelected} />
              </div>
            </div>
            <button type="submit" className="neo-btn info" style={{ width: '100%', marginTop: '0.5rem' }} disabled={!isEmployeeSelected}>
              <ShoppingBag size={14} /> Add to Cart
            </button>
          </form>

          {cartItems.length > 0 ? (
            <div className="neo-table-container" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <table className="neo-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th className="num">Price</th>
                    <th className="num">Qty</th>
                    <th className="num">Total</th>
                    <th style={{ width: '30px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td className="num">₹{item.price.toFixed(2)}</td>
                      <td className="num">{item.qty}</td>
                      <td className="num">₹{item.total.toFixed(2)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button type="button" className="trash-btn" onClick={() => removeCartItem(item.id)}>
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state" style={{ marginTop: '0.75rem', padding: '1rem' }}>
              Cart is empty.
            </div>
          )}
        </div>

        {/* COLUMN 3: Step 3 Address & Post */}
        <div className={`neo-card ${!isEmployeeSelected ? 'locked-panel' : ''}`}>
          {!isEmployeeSelected && (
            <div
              className="locked-panel-message"
              onMouseEnter={() => setShowLockedTip({ ...showLockedTip, step3: true })}
              onMouseLeave={() => setShowLockedTip({ ...showLockedTip, step3: false })}
            >
              <Lock size={14} /> Step 1 Required
              {showLockedTip.step3 && (
                <div className="locked-tooltip">
                  Complete Staff Verification in Step 1 to unlock this section
                </div>
              )}
            </div>
          )}

          <div className="neo-card-header">
            <h2 className="neo-card-title">
              <span className="badge purple">03</span>
              Address & Post
            </h2>
            <span className="card-badge">Step 3 of 3</span>
          </div>

          <form onSubmit={handleCompileInvoice}>
            <div className="form-row form-row-custom-2">
              <div className="form-group">
                <label htmlFor="ship-state">State / Country</label>
                <select id="ship-state" name="state" className="neo-select" value={shippingForm.state} onChange={handleShippingChange} disabled={!isEmployeeSelected}>
                  <option value="">-- Select state / country --</option>
                  {STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="ship-address">Enter Delivery Address</label>
                <input id="ship-address" type="text" name="address" className="neo-input" placeholder="Enchant delivery address..." value={shippingForm.address} onChange={handleShippingChange} disabled={!isEmployeeSelected} />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <label>Packaging Type</label>
              <div className="radio-cards-grid" style={{ gridTemplateColumns: '1fr', gap: '0.4rem' }}>
                {Object.keys(PACKAGING_OPTIONS).slice(0, 3).map((key) => {
                  const opt = PACKAGING_OPTIONS[key];
                  const isSelected = shippingForm.packagingType === key;
                  return (
                    <div key={key} className={`radio-card ${isSelected ? 'selected' : ''} ${!isEmployeeSelected ? 'disabled' : ''}`} onClick={() => handlePackagingSelect(key)} style={{ padding: '0.5rem', gap: '0.5rem' }}>
                      <input type="radio" name="packagingType" checked={isSelected} disabled={!isEmployeeSelected} onChange={() => {}} />
                      <div className="radio-card-content">
                        <span className="radio-card-title" style={{ fontSize: '0.8rem' }}>{opt.name} (+₹{opt.price.toFixed(2)})</span>
                        <span className="radio-card-desc" style={{ fontSize: '0.65rem' }}>{opt.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="form-row form-row-2" style={{ marginTop: '0.5rem' }}>
              <div className="form-group">
                <label htmlFor="ship-method">Delivery Mode</label>
                <select id="ship-method" name="deliveryMethod" className="neo-select" value={shippingForm.deliveryMethod} onChange={handleShippingChange} disabled={!isEmployeeSelected}>
                  {Object.keys(SHIPPING_METHODS).map((key) => (
                    <option key={key} value={key}>{SHIPPING_METHODS[key].name.split(' ')[0]} (₹{SHIPPING_METHODS[key].price.toFixed(2)})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="ship-notes">Instructions</label>
                <input id="ship-notes" type="text" name="notes" className="neo-input" placeholder="Notes..." value={shippingForm.notes} onChange={handleShippingChange} disabled={!isEmployeeSelected} />
              </div>
            </div>

            <button type="submit" className="neo-btn primary" style={{ width: '100%', marginTop: '1rem' }} disabled={!isEmployeeSelected}>
              <Save size={16} /> Place Order (Press Enter)
            </button>
          </form>

          {isCompiled && (
            <div className="employee-active-card" style={{ background: 'var(--color-green-light)', border: '2px solid var(--border-color)', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '0.4rem', boxShadow: 'var(--shadow-flat-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'bold', fontSize: '0.8rem', color: '#1a5f20' }}>
                <Check size={14} /> <span>Invoice Generated Successfully!</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                <strong>ID:</strong> {invoiceNumber}<br />
                <strong>Total:</strong> ₹{getGrandTotal().toFixed(2)}
              </div>
              <button type="button" className="neo-btn neo-btn-sm success" style={{ width: '100%', marginTop: '0.25rem', padding: '0.25rem' }} onClick={() => setShowReceiptPanel(true)}>
                <FileText size={10} /> View Paper Receipt
              </button>
            </div>
          )}
        </div>
      </div>

      {/* INVOICE LOGS */}
      {displayedLogs.length > 0 && (
        <section className="logs-section">
          <h2 style={{ textTransform: 'uppercase', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} />
            {selectedEmployee ? `${selectedEmployee.name}'s Logs` : 'Order Logs'} ({displayedLogs.length} Invoices Generated Today)
          </h2>
          <div className="logs-grid">
            {displayedLogs.map((log) => (
              <div key={log.invoiceNumber} className="log-mini-card" onClick={() => {
                alert(`Spell Invoice Details for ${log.invoiceNumber}:\n\nCaster: ${log.employee.name} (${log.employee.id})\nDestination State: ${log.state}\nTotal Items: ${log.itemsCount}\nGrand Total: ₹${log.grandTotal.toFixed(2)}\nPackaging: ${log.packaging}`);
              }}>
                <div className="log-mini-header">
                  <span className="mono-text">{log.invoiceNumber}</span>
                  <span className="badge green" style={{ padding: '0.05rem 0.25rem', fontSize: '0.65rem' }}>{log.state}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.25rem' }}>
                  <span className="log-mini-total">₹{log.grandTotal.toFixed(2)}</span>
                  <span className="log-mini-details">{log.itemsCount} items</span>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Issued by: {log.employee.name}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* REGISTERED WIZARDS */}
      <section className="wizards-section">
        <div className="wizards-header">
          <h2 className="wizards-title">
            <UserPlus size={16} /> Registered Wizards ({employees.length})
          </h2>
          <div className="wizards-actions">
            <button className="neo-btn neo-btn-sm" onClick={scrollToTop}><ArrowUp size={12} /> New</button>
            <button className="neo-btn neo-btn-sm" onClick={() => setShowOrdersPopup(true)}><Eye size={12} /> Orders</button>
          </div>
        </div>
        {employees.length > 0 ? (
          <div className="wizards-grid">
            {employeeOrder.map((id) => {
              const emp = employees.find(e => e.id === id);
              if (!emp) return null;
              return (
                <div key={emp.id} className={`wizard-card ${selectedEmployee?.id === emp.id ? 'active' : ''}`}>
                  <div className="wizard-card-body" onClick={() => { setSelectedEmployee(emp); setNewEmployeeMode(false); setIsCompiled(false); }}>
                    <div className="wizard-avatar">{emp.name.split(' ').map(n => n[0]).join('')}</div>
                    <div className="wizard-info">
                      <span className="wizard-name">{emp.name}</span>
                      <span className="wizard-id">{emp.id} &middot; {emp.role}</span>
                      <span className="wizard-dept">{emp.dept}</span>
                    </div>
                    <span className={`badge ${emp.status === 'On Duty' ? 'green' : 'yellow'}`}>{emp.status}</span>
                  </div>
                  <button className="wizard-delete-btn" onClick={() => deleteEmployee(emp.id)} title="Remove wizard"><Trash2 size={12} /></button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state wizard-empty">
            <UserPlus size={20} />
            <p>No wizards registered yet. Add one in <strong>Staff Verification</strong>!</p>
          </div>
        )}
      </section>

      {/* ORDERS POPUP */}
      {showOrdersPopup && (
        <div className="popup-overlay" onClick={() => { cancelEditLog(); setShowOrdersPopup(false); }}>
          <div className="popup-modal" onClick={e => e.stopPropagation()}>
            <div className="popup-header">
              <h3><FileText size={16} /> {selectedEmployee ? `${selectedEmployee.name}'s Orders` : 'All Invoices Generated Orders'} ({displayedLogs.length})</h3>
              <button className="neo-btn neo-btn-sm" onClick={() => { cancelEditLog(); setShowOrdersPopup(false); }}><X size={12} /></button>
            </div>
            <div className="popup-body">
              {displayedLogs.length > 0 ? (
                <div className="popup-orders-list">
                  {displayedLogs.map(log => (
                    <div key={log.invoiceNumber} className={`popup-order-item ${editingLogId === log.invoiceNumber ? 'editing' : ''}`}>
                      {editingLogId === log.invoiceNumber ? (
                        <>
                          <div className="popup-order-top">
                            <span className="mono-text" style={{ fontWeight: 700 }}>{log.invoiceNumber}</span>
                            <span className="badge green" style={{ fontSize: '0.6rem' }}>{log.state}</span>
                          </div>
                          <div className="popup-edit-fields">
                            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                              <label style={{ fontSize: '0.65rem' }}>State</label>
                              <select className="neo-select" value={editLogData.state || log.state} onChange={e => handleEditChange('state', e.target.value)} style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem' }}>
                                {STATES.map(st => <option key={st} value={st}>{st}</option>)}
                              </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                              <label style={{ fontSize: '0.65rem' }}>Packaging</label>
                              <select className="neo-select" value={editLogData.packaging || log.packaging} onChange={e => handleEditChange('packaging', e.target.value)} style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem' }}>
                                {Object.values(PACKAGING_OPTIONS).map(opt => <option key={opt.name} value={opt.name}>{opt.name}</option>)}
                              </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                              <label style={{ fontSize: '0.65rem' }}>Notes</label>
                              <input className="neo-input" type="text" value={editLogData.notes || ''} onChange={e => handleEditChange('notes', e.target.value)} placeholder="Optional delivery notes..." style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem' }} />
                            </div>
                          </div>
                          <div className="popup-order-edit-actions">
                            <button className="neo-btn neo-btn-sm success" onClick={saveLogEdit}><Save size={11} /> Save</button>
                            <button className="neo-btn neo-btn-sm" onClick={cancelEditLog}>Cancel</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="popup-order-top">
                            <span className="mono-text" style={{ fontWeight: 700 }}>{log.invoiceNumber}</span>
                            <span className="badge green" style={{ fontSize: '0.6rem' }}>{log.state}</span>
                          </div>
                          <div className="popup-order-details">
                            <span>Caster: {log.employee.name}</span>
                            <span className="mono-text" style={{ fontWeight: 700 }}>₹{log.grandTotal.toFixed(2)}</span>
                          </div>
                          <div className="popup-order-meta">
                            <span>{log.date}</span>
                            <span>{log.itemsCount} items &middot; {log.packaging}</span>
                          </div>
                          <button className="popup-order-edit-btn" onClick={() => startEditLog(log)} title="Edit order details">Edit</button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state" style={{ margin: '1rem', padding: '2rem' }}>
                  <FileText size={24} />
                  <p>No invoices generated orders yet. Compile an invoice to see it here!</p>
                </div>
              )}
            </div>
            <div className="popup-footer">
              <button className="neo-btn" onClick={() => { cancelEditLog(); setShowOrdersPopup(false); }}>Close</button>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Revenue: ₹{getTotalRevenue().toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT PANEL */}
      <ReceiptPanel
        isOpen={showReceiptPanel}
        onClose={() => setShowReceiptPanel(false)}
        invoice={isCompiled ? { invoiceNumber, date: invoiceDate, employee: selectedEmployee } : null}
        cartItems={cartItems}
        shippingForm={shippingForm}
        calculations={{ getSubtotal, getDiscountTotal, getTaxTotal, getSurcharge, getGrandTotal }}
      />

      {/* EDIT PROFILE MODAL */}
      {showEditProfileModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditProfileModal(false)}
          onSave={(updatedUser) => {
            localStorage.setItem('wizago_user', JSON.stringify(updatedUser));
            setShowEditProfileModal(false);
            setShowProfileSuccess(true);
          }}
        />
      )}

      {showProfileSuccess && (
        <div className="popup-overlay" onClick={() => setShowProfileSuccess(false)}>
          <div className="popup-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 380, textAlign: 'center' }}>
            <div style={{ padding: '2.5rem 2rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <div className="confetti-wrap">
                <span className="confetti-piece" style={{ top: '10%', left: '10%', background: '#ffde47', animationDelay: '0s' }} />
                <span className="confetti-piece" style={{ top: '20%', right: '15%', background: '#ff6b6b', animationDelay: '0.15s' }} />
                <span className="confetti-piece" style={{ top: '5%', left: '50%', background: '#48dbfb', animationDelay: '0.3s' }} />
                <span className="confetti-piece" style={{ bottom: '25%', left: '8%', background: '#ff9ff3', animationDelay: '0.1s' }} />
                <span className="confetti-piece" style={{ bottom: '15%', right: '10%', background: '#54a0ff', animationDelay: '0.25s' }} />
                <span className="confetti-piece" style={{ top: '30%', right: '5%', background: '#5f27cd', animationDelay: '0.2s' }} />
                <span className="confetti-piece" style={{ bottom: '10%', left: '40%', background: '#ffde47', animationDelay: '0.35s' }} />
                <span className="confetti-piece" style={{ top: '40%', left: '5%', background: '#ff6b6b', animationDelay: '0.05s' }} />
              </div>
              <div style={{ fontSize: '3rem', lineHeight: 1 }}>🎉</div>
              <h2 style={{ textTransform: 'uppercase', fontSize: '1.2rem', margin: 0 }}>Changes Saved!</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Your wizard profile has been updated successfully.</p>
              <button className="neo-btn primary" onClick={() => setShowProfileSuccess(false)} style={{ marginTop: '0.5rem' }}>
                <Check size={14} /> Got it
              </button>
            </div>
            <button className="profile-popup-close" onClick={() => setShowProfileSuccess(false)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}>
              <X size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function EditProfileModal({ user, onClose, onSave }) {
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleSave = async () => {
    if (!name.trim()) return;
    setUploading(true);
    try {
      let avatarUrl = user.avatar;
      if (avatarFile) {
        const fd = new FormData();
        fd.append('file', avatarFile);
        fd.append('upload_preset', UPLOAD_PRESET);
        fd.append('api_key', API_KEY);
        const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
        const d = await r.json();
        if (d.secure_url) avatarUrl = d.secure_url;
      }
      let updatedUser = { ...user, name: name.trim(), avatar: avatarUrl };
      if (email !== user.email) updatedUser.email = email;

      try {
        const token = localStorage.getItem('wizago_token');
        const body = { name: name.trim(), avatar: avatarUrl };
        if (email !== user.email) body.email = email;
        if (newPassword) { body.currentPassword = currentPassword; body.newPassword = newPassword; }
        
        const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const API_URL = RAW_API_URL.replace(/\/api\/?$/, '');
        const res = await fetch(`${API_URL}/api/auth/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (res.ok) {
          updatedUser = { ...user, name: data.user.name, avatar: data.user.avatar, email: data.user.email };
        }
      } catch (err) {
        console.warn('Profile update API failed, falling back to local storage update:', err);
      }

      localStorage.setItem('wizago_user', JSON.stringify(updatedUser));
      onSave(updatedUser);
    } catch (err) {
      alert(err.message);
    } finally { setUploading(false); }
  };

  return (
    <div className="popup-overlay" onClick={() => !uploading && onClose()}>
      <div className="popup-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="popup-header">
          <h3><UserPlus size={16} /> Edit Profile</h3>
          <button className="neo-btn neo-btn-sm" onClick={onClose} disabled={uploading}><X size={12} /></button>
        </div>
        <div className="popup-body" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div className="profile-popup-avatar" style={{ cursor: 'pointer', width: 72, height: 72 }} onClick={() => fileRef.current?.click()}>
                {avatarPreview ? <img src={avatarPreview} alt="" /> : user.avatar ? <img src={user.avatar} alt="" /> : <div className="profile-popup-avatar-letter" style={{ fontSize: '1.8rem' }}>{user.name?.charAt(0)}</div>}
                {uploading && <div className="auth-avatar-spinner" />}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) { setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)); }
              }} />
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>Click avatar to change</span>
            </div>
            <div className="form-group">
              <label><User size={13} /> Wizard Name</label>
              <input className="neo-input" value={name} onChange={e => setName(e.target.value)} placeholder="Wizard Name" />
            </div>
            <div className="form-group">
              <label><Mail size={13} /> Email</label>
              <input className="neo-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" />
            </div>
            <div style={{ borderTop: '2px solid var(--border-color)', paddingTop: '1rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Change Password (leave blank to keep current)</p>
              <div className="form-group">
                <label><Lock size={13} /> Current Password</label>
                <input className="neo-input" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Current password" />
              </div>
              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label><Lock size={13} /> New Password</label>
                <input className="neo-input" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" />
              </div>
            </div>
          </div>
        </div>
        <div className="popup-footer" style={{ justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button className="neo-btn" onClick={onClose} disabled={uploading}>Cancel</button>
          <button className="neo-btn primary" onClick={handleSave} disabled={uploading || !name.trim()}>
            {uploading ? 'Saving...' : <><Save size={14} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}
