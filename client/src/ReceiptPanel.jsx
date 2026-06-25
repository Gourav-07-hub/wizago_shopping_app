import { X, Printer, FileText } from 'lucide-react';

const PACKAGING_OPTIONS = {
  polybag: { name: 'Standard Polybag', price: 1.50 },
  ecobox: { name: 'Cardboard Eco-Box', price: 3.00 },
  giftbox: { name: 'Premium Gift Box', price: 6.00 },
  woodcrate: { name: 'Heavy-Duty Wood Crate', price: 12.00 },
};

const SHIPPING_METHODS = {
  standard: { name: 'Standard Ground Owl', price: 0.00 },
  express: { name: 'Express Hippogriff', price: 5.00 },
  overnight: { name: 'Phoenix Air Express', price: 15.00 },
};

export default function ReceiptPanel({ isOpen, onClose, invoice, cartItems, shippingForm, calculations }) {
  if (!isOpen) return null;

  const getSubtotal = calculations?.getSubtotal || (() => 0);
  const getDiscountTotal = calculations?.getDiscountTotal || (() => 0);
  const getTaxTotal = calculations?.getTaxTotal || (() => 0);
  const getSurcharge = calculations?.getSurcharge || (() => 0);
  const getGrandTotal = calculations?.getGrandTotal || (() => 0);

  return (
    <>
      <div className="receipt-panel-overlay" onClick={onClose} />
      <div className={`receipt-panel ${isOpen ? 'open' : ''}`}>
        <div className="receipt-panel-header">
          <h3><FileText size={16} /> Invoice Preview</h3>
          <button className="neo-btn neo-btn-sm" onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <div className="receipt-panel-body">
          {invoice ? (
            <div className="receipt-panel-content">
              <div className="receipt-panel-stamp">WIZAGO APPROVED</div>

              <div className="receipt-panel-meta">
                <div>
                  <span className="receipt-panel-label">Invoice</span>
                  <span className="receipt-panel-value">{invoice.invoiceNumber}</span>
                </div>
                <div>
                  <span className="receipt-panel-label">Date</span>
                  <span className="receipt-panel-value">{invoice.date}</span>
                </div>
              </div>

              {invoice.employee && (
                <div className="receipt-panel-employee">
                  <strong>{invoice.employee.name}</strong>
                  <span>{invoice.employee.id} &middot; {invoice.employee.role}</span>
                </div>
              )}

              <div className="receipt-panel-section">
                <h4>Items</h4>
                <table className="receipt-panel-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(cartItems || []).map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.qty}</td>
                        <td>₹{item.price.toFixed(2)}</td>
                        <td>₹{item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="receipt-panel-section">
                <h4>Delivery</h4>
                <p>{shippingForm?.address}, {shippingForm?.state}</p>
                <p>Packaging: {PACKAGING_OPTIONS[shippingForm?.packagingType]?.name || 'N/A'}</p>
                <p>Shipping: {SHIPPING_METHODS[shippingForm?.deliveryMethod]?.name || 'N/A'}</p>
              </div>

              <div className="receipt-panel-totals">
                <div className="receipt-panel-total-row">
                  <span>Subtotal</span>
                  <span>₹{getSubtotal().toFixed(2)}</span>
                </div>
                {getDiscountTotal() > 0 && (
                  <div className="receipt-panel-total-row" style={{ color: 'var(--color-red)' }}>
                    <span>Discount</span>
                    <span>-₹{getDiscountTotal().toFixed(2)}</span>
                  </div>
                )}
                <div className="receipt-panel-total-row">
                  <span>Surcharge</span>
                  <span>₹{getSurcharge().toFixed(2)}</span>
                </div>
                <div className="receipt-panel-total-row">
                  <span>Tax</span>
                  <span>₹{getTaxTotal().toFixed(2)}</span>
                </div>
                <div className="receipt-panel-total-row grand">
                  <span>Grand Total</span>
                  <span>₹{getGrandTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="receipt-panel-empty">
              <FileText size={32} />
              <p>No invoices generated invoice yet.</p>
            </div>
          )}
        </div>

        <div className="receipt-panel-footer">
          <button className="neo-btn success" onClick={() => window.print()}>
            <Printer size={14} /> Print
          </button>
          <button className="neo-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </>
  );
}
