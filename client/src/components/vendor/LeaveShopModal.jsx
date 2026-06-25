import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function LeaveShopModal({ isOpen, onClose, onConfirm }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
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
            style={{ background: 'none', border: 'none', color: '#cbd5e0', cursor: 'pointer' }}
            className="no-print"
          >
            <X size={20} />
          </button>
        </div>
        <div className="leave-modal-icon">⚠️</div>
        <h2 className="leave-modal-title">LEAVE THE SHOP?</h2>
        <p className="leave-modal-text">
          "Your cart will be saved but you'll need to log in again to access your orders."
        </p>
        <div className="leave-modal-actions">
          <button className="leave-modal-btn stay" onClick={onClose}>
            STAY
          </button>
          <button className="leave-modal-btn leave" onClick={onConfirm}>
            LEAVE
          </button>
        </div>
      </div>
    </div>
  );
}
