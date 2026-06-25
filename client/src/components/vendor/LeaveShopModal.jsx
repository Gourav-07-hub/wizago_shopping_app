import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function LeaveShopModal({ isOpen, onClose, onConfirm }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="leave-modal-overlay" onClick={onClose}>
      <div className="leave-modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-1rem', marginRight: '-1rem' }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: '1px solid rgba(139,0,0,0.3)',
              color: '#9090a8',
              cursor: 'pointer',
              borderRadius: '4px',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s',
            }}
            className="no-print"
            onMouseEnter={e => { e.currentTarget.style.color = '#dc143c'; e.currentTarget.style.borderColor = '#dc143c'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#9090a8'; e.currentTarget.style.borderColor = 'rgba(139,0,0,0.3)'; }}
          >
            <X size={20} />
          </button>
        </div>
        <div className="leave-modal-icon">🔮</div>
        <h2 className="leave-modal-title">LEAVE THE SHOP?</h2>
        <p className="leave-modal-text">
          Your cart shall be preserved in the shadows, but you must prove yourself again to reclaim your orders.
        </p>
        <div className="leave-modal-actions">
          <button className="leave-cancel-btn" onClick={onClose}>
            STAY
          </button>
          <button className="leave-confirm-btn" onClick={onConfirm}>
            DEPART
          </button>
        </div>
      </div>
    </div>
  );
}
