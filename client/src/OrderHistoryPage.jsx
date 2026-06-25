import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, CreditCard, CheckCircle, X, FileText } from 'lucide-react';
import './OrderHistoryPage.css';

// Reusable vertical timeline component for customer history card
function OrderTimeline({ timeline = [], status = 'pending' }) {
  const standardEvents = [
    { type: 'placed', name: 'Order Placed', evtName: 'Order Placed', color: 'green' },
    { type: 'payment', name: 'Payment Status', evtName: 'Payment', color: 'yellow' },
    { type: 'priority', name: 'Priority Set', evtName: 'Priority Set', color: 'red' },
    { type: 'assignment', name: 'Assigned to Courier', evtName: 'Assigned', color: 'blue' },
    { type: 'delivered', name: 'Delivered', evtName: 'Delivered', color: 'green' }
  ];

  const timelineMap = {};
  timeline.forEach(eventObj => {
    const evName = eventObj.event || '';
    if (evName === 'Order Placed') timelineMap['placed'] = eventObj;
    else if (evName === 'Payment') timelineMap['payment'] = eventObj;
    else if (evName === 'Priority Set') timelineMap['priority'] = eventObj;
    else if (evName.startsWith('Assigned to') || evName === 'Employee Assigned') timelineMap['assignment'] = eventObj;
    else if (evName === 'Delivered') timelineMap['delivered'] = eventObj;
  });

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
        
        let dotClass = 'timeline-dot';
        if (isCompleted) {
          dotClass = `timeline-dot completed ${evt.color}`;
        }

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
                  {isCompleted ? completedEvent.detail : 'Pending dispatch'}
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

// Fullscreen Invoice Preview Overlay for Customer
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
    <div className="invoice-preview-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(10,10,20,0.9)', backdropFilter: 'blur(5px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', overflowY: 'auto' }} onClick={onClose}>
      <div className="invoice-preview-card print-invoice-area" style={{ backgroundColor: '#fff', color: '#000', padding: '2.5rem', width: '100%', maxWidth: '650px', boxShadow: '0 12px 30px rgba(0,0,0,0.5)', borderRadius: '4px', fontFamily: 'Courier New, Courier, monospace', position: 'relative' }} onClick={e => e.stopPropagation()}>
        <button 
          className="invoice-preview-close-btn no-print" 
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', backgroundColor: '#e2e8f0', color: '#000', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
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

export default function OrderHistoryPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showInvoicePopup, setShowInvoicePopup] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Normalize order items and attributes to prevent layout breakage on legacy structures
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
    try {
      const savedOrders = JSON.parse(localStorage.getItem('wizago_orders') || '[]');
      const normalized = savedOrders.map(normalizeOrder);
      setOrders(normalized);
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  }, []);

  // Escape key listeners for small popup card
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowInvoicePopup(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleViewInvoiceClick = (order) => {
    setSelectedOrder(order);
    setShowInvoicePopup(true);
  };

  const handlePrintTrigger = () => {
    setShowInvoicePopup(false);
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 200);
  };

  return (
    <div className="orders-page-container">
      <header className="orders-header no-print">
        <div className="orders-header-inner">
          <div className="orders-logo" onClick={() => navigate('/')}>
            <span>Wizago Shop</span>
          </div>
          <Link to="/" className="back-link">
            <ArrowLeft size={16} /> Back to Shop
          </Link>
        </div>
      </header>

      <main className="orders-content">
        <h1 className="orders-page-title no-print">Order History</h1>

        {orders.length === 0 ? (
          <div className="empty-orders-card no-print">
            <Clock size={48} className="empty-icon" />
            <h2>No orders found</h2>
            <p>You haven't placed any orders yet. Add items to your cart and place your first order!</p>
            <Link to="/" className="neo-btn primary start-shopping-btn">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const displayDate = order.date || new Date(order.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div key={order.id} className="order-history-card">
                  {/* Header of the Card */}
                  <div className="order-card-header no-print">
                    <div className="order-meta-info">
                      <span className="order-id-label">Order ID:</span>
                      <strong className="order-id-val">#{order.id}</strong>
                      <span className="order-date"><Clock size={12} /> {displayDate}</span>
                    </div>
                    <div className="order-status-badge" style={{
                      backgroundColor: order.status === 'delivered' ? 'rgba(72, 187, 120, 0.15)' : order.priority === 'urgent' ? 'rgba(229, 62, 62, 0.15)' : 'rgba(245, 196, 0, 0.15)',
                      color: order.status === 'delivered' ? '#48bb78' : order.priority === 'urgent' ? '#e53e3e' : '#f5c400',
                      borderColor: order.status === 'delivered' ? '#48bb78' : order.priority === 'urgent' ? '#e53e3e' : '#f5c400'
                    }}>
                      <CheckCircle size={14} /> <span style={{ textTransform: 'uppercase' }}>{order.status || 'pending'}</span>
                    </div>
                  </div>

                  {/* Body of the Card */}
                  <div className="order-card-body">
                    {/* Item list details column */}
                    <div className="order-items-details">
                      <h4 className="body-section-title">Items Ordered</h4>
                      <div className="order-items-grid">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="order-item-row">
                            <span className="item-qty">{item.qty}x</span>
                            <span className="item-name">{item.name}</span>
                            <span className="item-price">₹{(item.price * item.qty).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping location address column */}
                    <div className="order-shipping-details">
                      <div className="info-group">
                        <div className="info-title"><MapPin size={14} /> Delivery Address</div>
                        <p className="info-val">{order.customer?.address || order.address}</p>
                      </div>

                      <div className="info-group" style={{ marginTop: '1rem' }}>
                        <div className="info-title"><CreditCard size={14} /> Payment Method</div>
                        <p className="info-val" style={{ textTransform: 'capitalize' }}>
                          {order.paymentMethod || (order.paymentStatus === 'unpaid' ? 'Cash on Delivery' : 'Online Payment')}
                        </p>
                      </div>
                    </div>

                    {/* Delivery track timeline details column */}
                    <div className="order-timeline-details" style={{ borderLeft: '1px solid #2d2d4f', paddingLeft: '1.25rem' }}>
                      <h4 className="body-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Clock size={12} /> Delivery Timeline</h4>
                      <OrderTimeline timeline={order.timeline || []} status={order.status || 'pending'} />
                    </div>
                  </div>

                  {/* Footer of the Card */}
                  <div className="order-card-footer no-print">
                    <div className="pricing-breakdown">
                      <span>Subtotal: ₹{order.subtotal?.toFixed(2)}</span>
                      {order.priorityFee > 0 && <span>Priority: +₹{order.priorityFee.toFixed(2)}</span>}
                      {order.packagingFee > 0 && <span>Packaging: +₹{order.packagingFee.toFixed(2)}</span>}
                      {order.shippingFee > 0 && <span>Delivery: +₹{order.shippingFee.toFixed(2)}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div className="order-total-price">
                        <span>Total Paid:</span>
                        <strong>₹{(order.grandTotal || order.total)?.toFixed(2)}</strong>
                      </div>
                      <button 
                        type="button" 
                        className="neo-btn" 
                        onClick={() => handleViewInvoiceClick(order)}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <FileText size={12} /> View Invoice
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Invoice Popup Selection */}
      {showInvoicePopup && selectedOrder && (
        <div className="step-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(18, 18, 30, 0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, padding: '1rem' }} onClick={() => setShowInvoicePopup(false)}>
          <div className="invoice-popup-card" onClick={e => e.stopPropagation()} style={{ backgroundColor: '#1e1e38', border: '2px solid #f5c400', borderRadius: '8px', padding: '1.5rem', maxWidth: '320px', width: '90%', textAlign: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-1rem', marginRight: '-1rem', marginBottom: '0.5rem' }}>
              <button onClick={() => setShowInvoicePopup(false)} style={{ background: 'none', border: 'none', color: '#cbd5e0', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>
            <h3 className="invoice-popup-title" style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', color: '#fff', marginTop: 0, marginBottom: '1.25rem' }}>Invoice Options</h3>
            <div className="invoice-popup-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="invoice-popup-btn preview" onClick={() => { setShowInvoicePopup(false); setShowPreviewModal(true); }} style={{ padding: '0.7rem', fontWeight: 700, borderRadius: '4px', cursor: 'pointer', border: 'none', fontSize: '0.85rem', textTransform: 'uppercase', backgroundColor: '#f5c400', color: '#1a1a2e' }}>
                🟡 Preview Invoice
              </button>
              <button className="invoice-popup-btn download" onClick={handlePrintTrigger} style={{ padding: '0.7rem', fontWeight: 700, borderRadius: '4px', cursor: 'pointer', border: 'none', fontSize: '0.85rem', textTransform: 'uppercase', backgroundColor: '#48bb78', color: '#fff' }}>
                *️⃣ Print / Download
              </button>
              <button className="invoice-popup-btn cancel" onClick={() => setShowInvoicePopup(false)} style={{ padding: '0.7rem', fontWeight: 700, borderRadius: '4px', cursor: 'pointer', border: '1px solid #cbd5e0', fontSize: '0.85rem', textTransform: 'uppercase', backgroundColor: 'transparent', color: '#cbd5e0' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Invoice Preview Overlay */}
      <InvoicePreviewModal
        isOpen={showPreviewModal}
        order={selectedOrder}
        onClose={() => setShowPreviewModal(false)}
      />

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
