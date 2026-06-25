import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LogOut, ArrowLeft, X, Package, Clock, CheckCircle, 
  AlertCircle, MapPin, User, CreditCard, TrendingUp, 
  Calendar, Edit, FileText, ShoppingCart
} from 'lucide-react';
import { api } from '../api';
import './VendorOrdersPage.css';

// Reusable vertical timeline component
function OrderTimeline({ timeline = [], currentPriority = 'normal', status = 'pending' }) {
  // Define standard timeline events in sequential order
  const standardEvents = [
    { type: 'placed', name: 'Order Placed', match: 'Order Placed', color: 'green' },
    { type: 'payment', name: 'Payment', match: 'Payment', color: 'yellow' },
    { type: 'priority', name: 'Priority Set', match: 'Priority Set', color: 'red' },
    { type: 'assignment', name: 'Employee Assignment', match: 'Assigned', color: 'blue' },
    { type: 'delivered', name: 'Delivered', match: 'Delivered', color: 'green' }
  ];

  // Map existing timeline data
  const timelineMap = {};
  timeline.forEach(eventObj => {
    const evName = eventObj.event || '';
    if (evName === 'Order Placed') timelineMap['placed'] = eventObj;
    else if (evName === 'Payment') timelineMap['payment'] = eventObj;
    else if (evName === 'Priority Set') timelineMap['priority'] = eventObj;
    else if (evName.startsWith('Assigned to') || evName === 'Employee Assigned') timelineMap['assignment'] = eventObj;
    else if (evName === 'Delivered') timelineMap['delivered'] = eventObj;
  });

  // Filter visible events (Delivered is only visible if order is delivered)
  const visibleEvents = standardEvents.filter(e => {
    if (e.type === 'delivered') return status === 'delivered';
    return true;
  });

  return (
    <div className="timeline-tracker">
      {visibleEvents.map((evt, idx) => {
        const completedEvent = timelineMap[evt.type];
        const isCompleted = !!completedEvent;
        const nextEvent = visibleEvents[idx + 1];
        const nextIsCompleted = nextEvent && timelineMap[nextEvent.type];
        
        // Dot Color: Completed shows corresponding color, pending is gray hollow
        let dotClass = 'timeline-dot pending-dot';
        if (isCompleted) {
          dotClass = `timeline-dot completed ${evt.color}`;
        }

        // Line style connecting to next
        const lineClass = isCompleted && nextIsCompleted ? 'line-solid' : 'line-dashed';

        return (
          <div key={evt.type} className={`timeline-event-row ${lineClass}`}>
            <div className={dotClass}>
              {isCompleted && '✓'}
            </div>
            <div className="timeline-content-area">
              <div>
                <div className="timeline-event-title" style={{ fontWeight: isCompleted ? 'bold' : 'normal' }}>
                  {isCompleted ? completedEvent.event : evt.name}
                </div>
                <div className="timeline-event-desc">
                  {isCompleted ? completedEvent.detail : 'Pending action'}
                </div>
              </div>
              {isCompleted && (
                <span className="timeline-event-time">
                  {completedEvent.timestamp}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 3-Phase Processing Modal
function ProcessOrderModal({ isOpen, order, employees, onClose, onSave }) {
  const [step, setStep] = useState(1);
  
  // Phase 1 edits
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custState, setCustState] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [items, setItems] = useState([]);

  // Phase 2 edits
  const [assignedEmp, setAssignedEmp] = useState('');
  const [priority, setPriority] = useState('normal');
  const [packaging, setPackaging] = useState('Standard Polybag');
  const [deliveryMethod, setDeliveryMethod] = useState('Standard Ground Owl');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (order) {
      setStep(1);
      setCustName(order.customer?.name || order.customerName || '');
      setCustEmail(order.customer?.email || '');
      setCustState(order.customer?.state || '');
      setCustAddress(order.customer?.address || order.address || '');
      setItems(order.items ? JSON.parse(JSON.stringify(order.items)) : []);
      setAssignedEmp(order.assignedEmployee || '');
      setPriority(order.priority || 'normal');
      setPackaging(order.packaging || 'Standard Polybag');
      setDeliveryMethod(order.deliveryMethod || 'Standard Ground Owl');
      setNotes(order.notes || '');
    }
  }, [order, isOpen]);

  // Escape key close handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  // Pricing helper computations
  const getSubtotal = () => {
    return items.reduce((acc, item) => acc + (parseFloat(item.price || 0) * parseInt(item.qty || 0)), 0);
  };

  const getDiscountTotal = () => {
    return items.reduce((acc, item) => {
      const base = parseFloat(item.price || 0) * parseInt(item.qty || 0);
      return acc + (base * (parseFloat(item.discount || 0) / 100));
    }, 0);
  };

  const getTaxTotal = () => {
    return items.reduce((acc, item) => {
      const base = parseFloat(item.price || 0) * parseInt(item.qty || 0);
      const discounted = base - (base * (parseFloat(item.discount || 0) / 100));
      return acc + (discounted * (parseFloat(item.tax || 0) / 100));
    }, 0);
  };

  const getSurchargeFees = () => {
    // Surcharges for Priority
    const priorityFees = { normal: 0, high: 15, urgent: 35 };
    const priorityFee = priorityFees[priority] || 0;

    // Surcharges for Packaging
    const packagingFees = {
      'Standard Polybag': 1.50,
      'Cardboard Eco-Box': 3.00,
      'Heavy-Duty Wood Crate': 12.00
    };
    const packagingFee = packagingFees[packaging] || 0;

    // Surcharges for Delivery
    const deliveryFees = {
      'Standard Ground Owl': 0.00,
      'Phoenix Air Express': 15.00,
      'Instant Teleport': 45.00
    };
    const deliveryFee = deliveryFees[deliveryMethod] || 0;

    return { priorityFee, packagingFee, deliveryFee };
  };

  const calculateGrandTotal = () => {
    const { priorityFee, packagingFee, deliveryFee } = getSurchargeFees();
    return getSubtotal() - getDiscountTotal() + getTaxTotal() + priorityFee + packagingFee + deliveryFee;
  };

  // Inline table edits
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  // Phase transition validations
  const handleNext = () => {
    if (step === 1) {
      if (!custName.trim() || !custEmail.trim() || !custAddress.trim() || !custState.trim()) {
        alert('Please fill in all customer details.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!assignedEmp) {
        alert('Please assign an employee to process the dispatch.');
        return;
      }
      setStep(3);
    }
  };

  const handleDeliver = (markAsDelivered = true) => {
    const { priorityFee, packagingFee, deliveryFee } = getSurchargeFees();
    
    // Build updated order object
    const updatedOrder = {
      ...order,
      customer: {
        name: custName,
        email: custEmail,
        state: custState,
        address: custAddress
      },
      // Keep legacy compatibility
      customerName: custName,
      address: custAddress,
      items: items.map(i => ({
        ...i,
        qty: parseInt(i.qty),
        price: parseFloat(i.price),
        discount: parseFloat(i.discount),
        tax: parseFloat(i.tax)
      })),
      subtotal: getSubtotal(),
      priorityFee,
      packagingFee,
      shippingFee: deliveryFee,
      // legacy key support
      deliveryCharge: deliveryFee,
      tax: getTaxTotal(),
      total: calculateGrandTotal(),
      grandTotal: calculateGrandTotal(),
      priority,
      packaging,
      deliveryMethod,
      assignedEmployee: assignedEmp,
      notes,
    };

    onSave(updatedOrder, markAsDelivered);
  };

  return (
    <div className="step-modal-overlay" onClick={onClose}>
      <div className="step-modal-card" onClick={e => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="step-modal-header">
          <h3>Process Dispatch — {order.id}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#cbd5e0', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="step-progress-wrapper">
          <div className="step-progress-text">Step {step} of 3: {
            step === 1 ? 'Edit Order Details' : 
            step === 2 ? 'Packaging & Assignee' : 
            'Review & Deliver'
          }</div>
          <div className="step-progress-bar-bg">
            <div className="step-progress-bar-fill" style={{ width: `${(step / 3) * 100}%` }}></div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="step-modal-body">
          
          {step === 1 && (
            <div>
              <div className="modal-grid-2">
                <div className="modal-input-group">
                  <label>Customer Name</label>
                  <input 
                    type="text" 
                    className="neo-input" 
                    value={custName} 
                    onChange={e => setCustName(e.target.value)} 
                  />
                </div>
                <div className="modal-input-group">
                  <label>Customer Email</label>
                  <input 
                    type="email" 
                    className="neo-input" 
                    value={custEmail} 
                    onChange={e => setCustEmail(e.target.value)} 
                  />
                </div>
              </div>
              <div className="modal-grid-2">
                <div className="modal-input-group">
                  <label>State</label>
                  <select 
                    className="modal-inline-select" 
                    value={custState} 
                    onChange={e => setCustState(e.target.value)}
                  >
                    <option value="">Select State</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Surrey">Surrey (Wizarding UK)</option>
                    <option value="California">California</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="modal-input-group">
                  <label>Address</label>
                  <input 
                    type="text" 
                    className="neo-input" 
                    value={custAddress} 
                    onChange={e => setCustAddress(e.target.value)} 
                  />
                </div>
              </div>

              <h4 style={{ color: '#f5c400', marginTop: '1.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>Items Catalog (Inline Edit)</h4>
              <div style={{ overflowX: 'auto' }}>
                <table className="editable-items-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th style={{ width: '80px' }}>Qty</th>
                      <th style={{ width: '100px' }}>Price</th>
                      <th style={{ width: '80px' }}>Disc %</th>
                      <th style={{ width: '80px' }}>Tax %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <input 
                            type="text" 
                            className="editable-input-field" 
                            value={item.name} 
                            onChange={e => handleItemChange(idx, 'name', e.target.value)} 
                          />
                        </td>
                        <td>
                          <input 
                            type="number" 
                            className="editable-input-field" 
                            value={item.qty} 
                            onChange={e => handleItemChange(idx, 'qty', parseInt(e.target.value) || 0)} 
                          />
                        </td>
                        <td>
                          <input 
                            type="number" 
                            step="0.01" 
                            className="editable-input-field" 
                            value={item.price} 
                            onChange={e => handleItemChange(idx, 'price', parseFloat(e.target.value) || 0)} 
                          />
                        </td>
                        <td>
                          <input 
                            type="number" 
                            className="editable-input-field" 
                            value={item.discount} 
                            onChange={e => handleItemChange(idx, 'discount', parseFloat(e.target.value) || 0)} 
                          />
                        </td>
                        <td>
                          <input 
                            type="number" 
                            className="editable-input-field" 
                            value={item.tax} 
                            onChange={e => handleItemChange(idx, 'tax', parseFloat(e.target.value) || 0)} 
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="detail-grand-total-row">
                <span>Running Total:</span>
                <strong>₹{calculateGrandTotal().toFixed(2)}</strong>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="modal-grid-2">
                <div className="modal-input-group">
                  <label>Assign Employee</label>
                  <select 
                    className="modal-inline-select"
                    value={assignedEmp}
                    onChange={e => setAssignedEmp(e.target.value)}
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.name}>{emp.name} ({emp.role})</option>
                    ))}
                  </select>
                </div>
                <div className="modal-input-group">
                  <label>Packaging tier</label>
                  <select 
                    className="modal-inline-select"
                    value={packaging}
                    onChange={e => setPackaging(e.target.value)}
                  >
                    <option value="Standard Polybag">Standard Polybag (+₹1.50)</option>
                    <option value="Cardboard Eco-Box">Cardboard Eco-Box (+₹3.00)</option>
                    <option value="Heavy-Duty Wood Crate">Heavy-Duty Wood Crate (+₹12.00)</option>
                  </select>
                </div>
              </div>

              <div className="modal-grid-2" style={{ marginTop: '1rem' }}>
                <div className="modal-input-group">
                  <label>Priority processing</label>
                  <div className="priority-toggle-row">
                    {[
                      { val: 'normal', label: '🟢 Normal', fee: 'Free' },
                      { val: 'high', label: '🔥 High', fee: '+₹15' },
                      { val: 'urgent', label: '🚨 Urgent', fee: '+₹35' }
                    ].map(p => (
                      <button
                        key={p.val}
                        type="button"
                        className={`priority-toggle-btn ${priority === p.val ? 'active' : ''}`}
                        onClick={() => setPriority(p.val)}
                      >
                        <div>{p.label}</div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>{p.fee}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="modal-input-group">
                  <label>Delivery Method</label>
                  <select
                    className="modal-inline-select"
                    value={deliveryMethod}
                    onChange={e => setDeliveryMethod(e.target.value)}
                  >
                    <option value="Standard Ground Owl">Standard Ground Owl (₹0.00)</option>
                    <option value="Phoenix Air Express">Phoenix Air Express (+₹15.00)</option>
                    <option value="Instant Teleport">Instant Teleport (+₹45.00)</option>
                  </select>
                </div>
              </div>

              <div className="modal-input-group" style={{ marginTop: '1.5rem' }}>
                <label>Dispatch Notes</label>
                <textarea 
                  className="neo-input" 
                  rows="3" 
                  value={notes} 
                  placeholder="Any extra spell instructions, warning labels etc."
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="detail-section-card" style={{ background: 'var(--bg-card)', borderColor: '#f5c400' }}>
                <h4 style={{ textTransform: 'uppercase', color: '#f5c400', margin: '0 0 1rem 0', fontWeight: 800 }}>Wizago Emporium — Order Summary</h4>
                <div className="info-grid-custom">
                  <div className="info-row-custom">
                    <span className="info-row-label">Order ID</span>
                    <span className="info-row-val" style={{ fontFamily: 'monospace' }}>{order.id}</span>
                  </div>
                  <div className="info-row-custom">
                    <span className="info-row-label">Customer Details</span>
                    <span className="info-row-val">{custName} ({custEmail})</span>
                  </div>
                  <div className="info-row-custom full-width">
                    <span className="info-row-label">Delivery Address</span>
                    <span className="info-row-val">{custAddress}, {custState}</span>
                  </div>
                  <div className="info-row-custom">
                    <span className="info-row-label">Assigned Employee</span>
                    <span className="info-row-val">{assignedEmp}</span>
                  </div>
                  <div className="info-row-custom">
                    <span className="info-row-label">Priority level</span>
                    <span className="info-row-val" style={{ textTransform: 'uppercase' }}>{priority}</span>
                  </div>
                  <div className="info-row-custom">
                    <span className="info-row-label">Packaging</span>
                    <span className="info-row-val">{packaging}</span>
                  </div>
                  <div className="info-row-custom">
                    <span className="info-row-label">Shipping method</span>
                    <span className="info-row-val">{deliveryMethod}</span>
                  </div>
                  {notes && (
                    <div className="info-row-custom full-width">
                      <span className="info-row-label">Notes</span>
                      <span className="info-row-val" style={{ fontStyle: 'italic' }}>{notes}</span>
                    </div>
                  )}
                </div>
              </div>

              <h4 style={{ textTransform: 'uppercase', color: '#cbd5e0', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Artifacts Invoice Details</h4>
              <div style={{ overflowX: 'auto' }}>
                <table className="detail-items-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.name}</td>
                        <td>{item.qty}x</td>
                        <td>₹{parseFloat(item.price).toFixed(2)}</td>
                        <td>₹{(item.price * item.qty).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="detail-grand-total-row" style={{ marginTop: '1.5rem' }}>
                <span>Grand Total:</span>
                <strong>₹{calculateGrandTotal().toFixed(2)}</strong>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="step-modal-footer">
          <div>
            {step > 1 && (
              <button className="neo-btn" onClick={() => setStep(step - 1)}>
                ← Previous
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="neo-btn" onClick={() => handleDeliver(false)} style={{ border: '1px solid #cbd5e0', background: 'transparent', color: '#cbd5e0' }}>
              Save Draft
            </button>
            {step < 3 ? (
              <button className="neo-btn primary" onClick={handleNext}>
                Next →
              </button>
            ) : (
              <button className="neo-btn success" onClick={() => handleDeliver(true)} style={{ background: '#48bb78', color: '#fff' }}>
                ✓ Deliver Order
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// Fullscreen Invoice Preview Overlay
function InvoicePreviewModal({ isOpen, order, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const totalDiscount = order.items?.reduce((sum, item) => sum + (item.price * item.qty * (item.discount / 100)), 0) || 0;
  const totalTax = order.items?.reduce((sum, item) => {
    const base = item.price * item.qty - (item.price * item.qty * (item.discount / 100));
    return sum + (base * (item.tax / 100));
  }, 0) || 0;

  return (
    <div className="invoice-preview-overlay" onClick={onClose}>
      <div className="invoice-preview-card print-invoice-area" onClick={e => e.stopPropagation()}>
        <button className="invoice-preview-close-btn no-print" onClick={onClose}>
          <X size={16} />
        </button>
        
        <div style={{ textAlign: 'center', borderBottom: '2px dashed #000', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', fontSize: '1.5rem', letterSpacing: '0.05em' }}>🏪 Wizago Shop</h2>
          <div>Invoice #{order.id}</div>
          <div style={{ fontSize: '0.85rem', color: '#555', marginTop: '0.25rem' }}>
            Date: {order.date || new Date(order.createdAt).toLocaleDateString('en-IN')}
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: '1.4' }}>
          <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Bill To:</strong>
          <div>{order.customer?.name || order.customerName}</div>
          <div>{order.customer?.email || 'customer@wizago.com'}</div>
          <div>{order.customer?.address || order.address}</div>
          <div>{order.customer?.state}</div>
        </div>

        <div style={{ borderBottom: '1px solid #000', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Items Purchased:</strong>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px dashed #000' }}>
                <th style={{ textAlign: 'left', padding: '0.25rem 0' }}>Product</th>
                <th style={{ textAlign: 'center', padding: '0.25rem 0' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '0.25rem 0' }}>Price</th>
                <th style={{ textAlign: 'right', padding: '0.25rem 0' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '0.4rem 0' }}>{item.name}</td>
                  <td style={{ textAlign: 'center', padding: '0.4rem 0' }}>{item.qty}</td>
                  <td style={{ textAlign: 'right', padding: '0.4rem 0' }}>₹{item.price.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '0.4rem 0' }}>₹{(item.price * item.qty).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'flex-end', fontSize: '0.85rem', borderBottom: '2px solid #000', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', width: '220px', justifyContent: 'space-between' }}>
            <span>Subtotal:</span>
            <span>₹{order.subtotal?.toFixed(2)}</span>
          </div>
          {totalDiscount > 0 && (
            <div style={{ display: 'flex', width: '220px', justifyContent: 'space-between', color: '#555' }}>
              <span>Discounts:</span>
              <span>-₹{totalDiscount.toFixed(2)}</span>
            </div>
          )}
          {totalTax > 0 && (
            <div style={{ display: 'flex', width: '220px', justifyContent: 'space-between' }}>
              <span>Tax (GST):</span>
              <span>+₹{totalTax.toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: 'flex', width: '220px', justifyContent: 'space-between' }}>
            <span>Priority Fee:</span>
            <span>+₹{(order.priorityFee || 0).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', width: '220px', justifyContent: 'space-between' }}>
            <span>Packaging Fee:</span>
            <span>+₹{(order.packagingFee || 0).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', width: '220px', justifyContent: 'space-between' }}>
            <span>Shipping:</span>
            <span>+₹{(order.shippingFee || 0).toFixed(2)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem' }}>
          <span>TOTAL:</span>
          <span>₹{(order.grandTotal || order.total).toFixed(2)}</span>
        </div>

        <div style={{ marginTop: '2rem', borderTop: '1px dashed #000', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
          <span>Payment: <strong style={{ textTransform: 'uppercase' }}>{order.paymentStatus || 'Paid'}</strong></span>
          <span>Thank you for shopping with us! 🧙‍♂️</span>
        </div>
      </div>
    </div>
  );
}

// MAIN PAGE
export default function VendorOrdersPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [filter, setFilter] = useState('pending'); // 'pending' | 'delivered' | 'urgent'
  const [employees, setEmployees] = useState([]);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showInvoicePopup, setShowInvoicePopup] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [toast, setToast] = useState(null);

  // Normalization logic for older logs
  const normalizeOrder = (order) => {
    const id = order.id || order.invoiceNumber || `ORD-MQP90VFX`;
    
    let customer = order.customer || {
      name: order.customerName || 'Unknown Customer',
      email: order.email || 'customer@wizago.com',
      state: order.state || 'Unknown State',
      address: order.address || 'Unknown Address'
    };

    let status = order.status ? order.status.toLowerCase() : 'pending';
    if (status === 'placed') status = 'pending';

    const items = order.items ? order.items.map(item => ({
      name: item.name || 'Enchanted Item',
      qty: item.qty || 1,
      price: item.price || 0,
      discount: item.discount || 0,
      tax: item.tax || 0
    })) : [];

    const subtotal = order.subtotal || order.subTotal || items.reduce((acc, i) => acc + i.price * i.qty, 0);
    const priorityFee = order.priorityFee || 0;
    const packagingFee = order.packagingFee || 0;
    const shippingFee = order.shippingFee || order.deliveryCharge || 0;
    const grandTotal = order.grandTotal || order.total || (subtotal + priorityFee + packagingFee + shippingFee);

    const priority = order.priority || 'normal';
    const packaging = order.packaging || 'Standard Polybag';
    const deliveryMethod = order.deliveryMethod || 'Standard Ground Owl';
    const assignedEmployee = order.assignedEmployee || (order.employee ? order.employee.name : 'Unassigned');
    const notes = order.notes || '';

    let timeline = order.timeline || [];
    if (timeline.length === 0) {
      timeline = [
        {
          event: "Order Placed",
          detail: "Order successfully placed by customer",
          timestamp: order.date || new Date().toLocaleString('en-IN')
        },
        {
          event: "Payment",
          detail: order.paymentStatus === 'paid' ? "Paid" : "Skipped / Unpaid",
          timestamp: order.date || new Date().toLocaleString('en-IN')
        }
      ];
      if (priority !== 'normal') {
        timeline.push({
          event: "Priority Set",
          detail: `Priority set to ${priority}`,
          timestamp: order.date || new Date().toLocaleString('en-IN')
        });
      }
      if (assignedEmployee !== 'Unassigned') {
        timeline.push({
          event: `Assigned to ${assignedEmployee}`,
          detail: `Order assigned to ${assignedEmployee} for processing`,
          timestamp: order.date || new Date().toLocaleString('en-IN')
        });
      }
      if (status === 'delivered') {
        timeline.push({
          event: "Delivered",
          detail: "Order marked as delivered by vendor",
          timestamp: order.deliveredAt || new Date().toLocaleString('en-IN')
        });
      }
    }

    const createdAt = order.createdAt || new Date().toISOString();
    const deliveredAt = order.deliveredAt || null;
    const paymentStatus = order.paymentStatus || (order.paymentMethod === 'Cash on Delivery' ? 'unpaid' : 'paid');

    return {
      ...order,
      id,
      customer,
      items,
      subtotal,
      priorityFee,
      packagingFee,
      shippingFee,
      grandTotal,
      priority,
      packaging,
      deliveryMethod,
      assignedEmployee,
      notes,
      status,
      paymentStatus,
      timeline,
      createdAt,
      deliveredAt
    };
  };

  useEffect(() => {
    // Load and normalize orders
    const saved = JSON.parse(localStorage.getItem('wizago_orders') || '[]');
    const normalized = saved.map(normalizeOrder);
    setOrders(normalized);

    // Fetch employee list
    api.employees.list().then(list => {
      setEmployees(list);
    }).catch(() => {
      const defaultEmployees = [
        { id: 'EMP001', name: 'Albus D.', role: 'Headmaster', status: 'On Duty' },
        { id: 'EMP002', name: 'Minerva M.', role: 'Deputy Headmistress', status: 'On Duty' },
        { id: 'EMP003', name: 'Severus S.', role: 'Potion Master', status: 'On Duty' }
      ];
      setEmployees(defaultEmployees);
    });
  }, []);

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Keyboard escape listeners for small popup card
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowInvoicePopup(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  // Filter orders by tab
  const filteredOrders = orders.filter(order => {
    if (filter === 'pending') {
      return order.status !== 'delivered';
    } else if (filter === 'delivered') {
      return order.status === 'delivered';
    } else if (filter === 'urgent') {
      return order.status !== 'delivered' && order.priority === 'urgent';
    }
    return true;
  });

  // Sort: Latest first (by createdAt or date)
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    return new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime();
  });

  // Save changes from modal
  const handleSaveModalData = (updatedOrder, markAsDelivered) => {
    let finalOrder = { ...updatedOrder };
    
    // Auto-update timeline
    const timestampStr = new Date().toLocaleString('en-IN');
    let currentTimeline = [...finalOrder.timeline];

    // Find and update/add "Priority Set"
    currentTimeline = currentTimeline.filter(t => t.event !== "Priority Set");
    currentTimeline.push({
      event: "Priority Set",
      detail: `Priority set to ${finalOrder.priority.toUpperCase()}`,
      timestamp: timestampStr
    });

    // Find and update/add Employee assignment
    currentTimeline = currentTimeline.filter(t => !t.event.startsWith("Assigned to") && t.event !== "Employee Assigned");
    currentTimeline.push({
      event: `Assigned to ${finalOrder.assignedEmployee}`,
      detail: `Order assigned to ${finalOrder.assignedEmployee} for processing`,
      timestamp: timestampStr
    });

    if (markAsDelivered) {
      finalOrder.status = 'delivered';
      finalOrder.deliveredAt = new Date().toISOString();
      finalOrder.paymentStatus = 'paid'; // Automatically marked paid on final delivery completion

      // Remove legacy Delivered and add latest
      currentTimeline = currentTimeline.filter(t => t.event !== "Delivered");
      currentTimeline.push({
        event: "Delivered",
        detail: "Order marked as delivered by vendor",
        timestamp: timestampStr
      });
      
      // Update Payment timeline detail to Paid if it wasn't
      const payIdx = currentTimeline.findIndex(t => t.event === "Payment");
      if (payIdx > -1) {
        currentTimeline[payIdx].detail = "Paid";
        currentTimeline[payIdx].timestamp = timestampStr;
      }
    }

    finalOrder.timeline = currentTimeline;

    // Save to local state + LocalStorage
    const updatedOrders = orders.map(o => o.id === finalOrder.id ? finalOrder : o);
    setOrders(updatedOrders);
    localStorage.setItem('wizago_orders', JSON.stringify(updatedOrders));

    setShowProcessModal(false);
    if (markAsDelivered) {
      showToastMsg("Order marked as delivered! 🎉");
    } else {
      showToastMsg("Order draft updated successfully.");
    }
  };

  // Stats computations
  const totalCount = orders.length;
  const pendingCount = orders.filter(o => o.status !== 'delivered').length;
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;
  const allTimeRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + (o.grandTotal || o.total || 0), 0);

  const getThisMonthRevenue = () => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    return orders
      .filter(o => {
        if (o.status !== 'delivered') return false;
        const dateStr = o.createdAt || o.date;
        if (!dateStr) return false;
        const d = new Date(dateStr);
        return d.getFullYear() === curYear && d.getMonth() === curMonth;
      })
      .reduce((sum, o) => sum + (o.grandTotal || o.total || 0), 0);
  };

  const thisMonthRevenue = getThisMonthRevenue();

  // Print execution helper
  const handlePrintTrigger = () => {
    setShowInvoicePopup(false);
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 200);
  };

  return (
    <div className="vendor-pipeline-container">
      {/* Header */}
      <header className="vendor-header no-print">
        <div className="vendor-header-inner">
          <div className="vendor-logo" onClick={() => navigate('/vendor/dashboard')} style={{ cursor: 'pointer' }}>
            <span>Wizago Vendor</span>
          </div>
          <div className="vendor-header-right">
            <span className="vendor-welcome">Welcome back, <strong>{user?.name || 'Vendor'}</strong></span>
            <button className="logout-btn" onClick={onLogout}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Panel Content */}
      <div className="vendor-pipeline-main">
        {/* Left Side: Order list and filter tags */}
        <div className="pipeline-left-panel no-print">
          <div className="pipeline-left-header">
            <h2>Order Pipeline</h2>
            <span className="order-count-badge">{orders.length}</span>
          </div>

          <div className="pipeline-filter-tabs">
            {['pending', 'delivered', 'urgent'].map(t => (
              <button
                key={t}
                className={`filter-tab-btn ${filter === t ? 'active' : ''}`}
                onClick={() => setFilter(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="pipeline-orders-list">
            {sortedOrders.map(order => {
              const isSelected = order.id === selectedOrderId;
              let badgeClass = 'status-badge-custom pending';
              if (order.status === 'delivered') badgeClass = 'status-badge-custom delivered';
              else if (order.priority === 'urgent') badgeClass = 'status-badge-custom urgent';

              return (
                <div
                  key={order.id}
                  className={`pipeline-order-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedOrderId(order.id)}
                >
                  <div className="order-item-left">
                    <span className="order-item-id">#{order.id}</span>
                    <span className="order-item-cust">{order.customer?.name}</span>
                  </div>
                  <div className="order-item-right">
                    <span className="order-item-amt">₹{(order.grandTotal || order.total || 0).toFixed(2)}</span>
                    <span className={badgeClass}>
                      {order.status === 'delivered' ? 'Delivered' : order.priority === 'urgent' ? 'Urgent' : 'Pending'}
                    </span>
                  </div>
                </div>
              );
            })}
            {sortedOrders.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#cbd5e0', fontSize: '0.85rem' }}>
                No orders in this pipeline tab.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: details and timeline views */}
        <div className="pipeline-right-panel">
          {selectedOrder ? (
            <div>
              <div className="right-panel-header no-print">
                <h2>Order: {selectedOrderId}</h2>
                <button className="pipeline-back-btn" onClick={() => navigate('/vendor/dashboard')}>
                  <ArrowLeft size={14} /> Back to Hub
                </button>
              </div>

              <div className="pipeline-detail-content">
                {/* Information Card Column */}
                <div>
                  {/* Timeline section */}
                  <div className="detail-section-card">
                    <h3 className="detail-card-title-bar"><Clock size={16} /> Live Dispatch Timeline</h3>
                    <OrderTimeline 
                      timeline={selectedOrder.timeline} 
                      currentPriority={selectedOrder.priority} 
                      status={selectedOrder.status} 
                    />
                  </div>

                  {/* Customer location cards */}
                  <div className="detail-section-card">
                    <h3 className="detail-card-title-bar"><User size={16} /> Customer Shipping Details</h3>
                    <div className="info-grid-custom">
                      <div className="info-row-custom">
                        <span className="info-row-label">Name</span>
                        <span className="info-row-val">{selectedOrder.customer?.name}</span>
                      </div>
                      <div className="info-row-custom">
                        <span className="info-row-label">Email</span>
                        <span className="info-row-val">{selectedOrder.customer?.email || 'N/A'}</span>
                      </div>
                      <div className="info-row-custom full-width">
                        <span className="info-row-label">Address</span>
                        <span className="info-row-val">{selectedOrder.customer?.address || selectedOrder.address}</span>
                      </div>
                      <div className="info-row-custom">
                        <span className="info-row-label">State</span>
                        <span className="info-row-val">{selectedOrder.customer?.state || 'N/A'}</span>
                      </div>
                      <div className="info-row-custom">
                        <span className="info-row-label">Payment status</span>
                        <span className="info-row-val" style={{ textTransform: 'uppercase', color: selectedOrder.paymentStatus === 'unpaid' ? '#e53e3e' : '#48bb78' }}>
                          {selectedOrder.paymentStatus || 'unpaid'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items Purchased details */}
                <div>
                  <div className="detail-section-card">
                    <h3 className="detail-card-title-bar"><Package size={16} /> Magic Artifacts</h3>
                    <table className="detail-items-table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Qty</th>
                          <th style={{ textAlign: 'right' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items?.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.name}</td>
                            <td>{item.qty}x</td>
                            <td style={{ textAlign: 'right' }}>₹{(item.price * item.qty).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {/* Packaging, priority surcharge metadata details */}
                    <div style={{ marginTop: '1rem', borderTop: '1px solid #2d2d4f', paddingTop: '0.75rem', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#a0aec0' }}>Priority fee:</span>
                        <span>₹{(selectedOrder.priorityFee || 0).toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#a0aec0' }}>Packaging Fee:</span>
                        <span>₹{(selectedOrder.packagingFee || 0).toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#a0aec0' }}>Delivery Method charge:</span>
                        <span>₹{(selectedOrder.shippingFee || selectedOrder.deliveryCharge || 0).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="detail-grand-total-row">
                      <span>Total:</span>
                      <strong>₹{(selectedOrder.grandTotal || selectedOrder.total || 0).toFixed(2)}</strong>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="detail-actions-bar no-print">
                    <button 
                      className="neo-btn primary" 
                      onClick={() => setShowProcessModal(true)}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                    >
                      <Edit size={16} /> Process Order
                    </button>
                    <button 
                      className="neo-btn success" 
                      onClick={() => setShowInvoicePopup(true)}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                    >
                      <FileText size={16} /> Invoice
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="right-panel-empty no-print">
              <ShoppingCart size={48} style={{ color: '#cbd5e0' }} />
              <p>Select an order from the list to view details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Stats Bar */}
      <footer className="vendor-stats-bar-sticky no-print">
        <div className="stats-bar-item">
          📦 <strong>{totalCount}</strong> total
        </div>
        <div className="stats-bar-item">
          ⏳ <strong>{pendingCount}</strong> pending
        </div>
        <div className="stats-bar-item">
          ✅ <strong>{deliveredCount}</strong> delivered
        </div>
        <div className="stats-bar-item">
          💰 <strong>₹{allTimeRevenue.toFixed(2)}</strong> all-time revenue
        </div>
        <div className="stats-bar-item">
          📅 <strong>₹{thisMonthRevenue.toFixed(2)}</strong> this month
        </div>
      </footer>

      {/* 3-Phase Edit modal */}
      <ProcessOrderModal
        isOpen={showProcessModal}
        order={selectedOrder}
        employees={employees}
        onClose={() => setShowProcessModal(false)}
        onSave={handleSaveModalData}
      />

      {/* Small Options invoice Popup modal */}
      {showInvoicePopup && (
        <div className="step-modal-overlay" onClick={() => setShowInvoicePopup(false)}>
          <div className="invoice-popup-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-1rem', marginRight: '-1rem', marginBottom: '0.5rem' }}>
              <button onClick={() => setShowInvoicePopup(false)} style={{ background: 'none', border: 'none', color: '#cbd5e0', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>
            <h3 className="invoice-popup-title">Invoice Options</h3>
            <div className="invoice-popup-buttons">
              <button className="invoice-popup-btn preview" onClick={() => { setShowInvoicePopup(false); setShowPreviewModal(true); }}>
                🟡 Preview Invoice
              </button>
              <button className="invoice-popup-btn download" onClick={handlePrintTrigger}>
                *️⃣ Print / Download
              </button>
              <button className="invoice-popup-btn cancel" onClick={() => setShowInvoicePopup(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen invoice preview overlay */}
      <InvoicePreviewModal
        isOpen={showPreviewModal}
        order={selectedOrder}
        onClose={() => setShowPreviewModal(false)}
      />

      {/* Toast notifications */}
      {toast && (
        <div className="wizago-toast no-print">
          {toast}
        </div>
      )}

      {/* Printable Area hidden on screen */}
      {isPrinting && selectedOrder && (
        <div id="print-root" className="print-invoice-area" style={{ display: 'block', visibility: 'visible', padding: '2rem', color: '#000', backgroundColor: '#fff', width: '100%', fontFamily: 'monospace' }}>
          <div style={{ textAlign: 'center', borderBottom: '2px dashed #000', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>🏪 Wizago Shop</h2>
            <div>Invoice #{selectedOrder.id}</div>
            <div>Date: {selectedOrder.date || new Date(selectedOrder.createdAt).toLocaleDateString('en-IN')}</div>
          </div>

          <div style={{ marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            <strong>Bill To:</strong>
            <div>{selectedOrder.customer?.name || selectedOrder.customerName}</div>
            <div>{selectedOrder.customer?.email}</div>
            <div>{selectedOrder.customer?.address || selectedOrder.address}</div>
            <div>{selectedOrder.customer?.state}</div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px dashed #000' }}>
                <th style={{ textAlign: 'left', padding: '0.3rem 0' }}>Item</th>
                <th style={{ textAlign: 'center', padding: '0.3rem 0' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '0.3rem 0' }}>Price</th>
                <th style={{ textAlign: 'right', padding: '0.3rem 0' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedOrder.items?.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '0.4rem 0' }}>{item.name}</td>
                  <td style={{ textAlign: 'center', padding: '0.4rem 0' }}>{item.qty}</td>
                  <td style={{ textAlign: 'right', padding: '0.4rem 0' }}>₹{item.price.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '0.4rem 0' }}>₹{(item.price * item.qty).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'flex-end', fontSize: '0.9rem', borderBottom: '2px solid #000', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', width: '220px', justifyContent: 'space-between' }}>
              <span>Subtotal:</span>
              <span>₹{selectedOrder.subtotal?.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', width: '220px', justifyContent: 'space-between' }}>
              <span>Priority Fee:</span>
              <span>+₹{(selectedOrder.priorityFee || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', width: '220px', justifyContent: 'space-between' }}>
              <span>Packaging Fee:</span>
              <span>+₹{(selectedOrder.packagingFee || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', width: '220px', justifyContent: 'space-between' }}>
              <span>Shipping Fee:</span>
              <span>+₹{(selectedOrder.shippingFee || selectedOrder.deliveryCharge || 0).toFixed(2)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem' }}>
            <span>TOTAL:</span>
            <span>₹{(selectedOrder.grandTotal || selectedOrder.total || 0).toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
