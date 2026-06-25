export default function PaymentMethod({ selectedMethod, onChange, disabled }) {
  return (
    <div className="form-card">
      <h3 className="form-card-title">Payment Method</h3>
      <div className="payment-options-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Pay Online Card */}
        <div
          className={`payment-method-card ${selectedMethod === 'razorpay' ? 'active' : ''}`}
          onClick={() => !disabled && onChange('razorpay')}
          style={{
            border: selectedMethod === 'razorpay' ? '2px solid #F5C400' : '2px solid #2d2d4f',
            backgroundColor: selectedMethod === 'razorpay' ? 'rgba(245, 196, 0, 0.08)' : '#111122',
            padding: '1.25rem',
            borderRadius: '8px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: disabled ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: selectedMethod === 'razorpay' ? '0 4px 12px rgba(245, 196, 0, 0.15)' : 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center' }}>💳</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
              <span style={{ fontWeight: '800', fontSize: '1.05rem', color: '#fff' }}>Pay Online</span>
              <span style={{ fontSize: '0.8rem', color: '#cbd5e0', textAlign: 'left' }}>
                UPI · Cards · NetBanking · Wallets
              </span>
            </div>
          </div>
          {selectedMethod === 'razorpay' && (
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: '#F5C400',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1a1a2e',
              fontSize: '0.75rem',
              fontWeight: 'bold'
            }}>✓</div>
          )}
        </div>

        {/* COD Card */}
        <div
          className={`payment-method-card ${selectedMethod === 'cod' ? 'active' : ''}`}
          onClick={() => !disabled && onChange('cod')}
          style={{
            border: selectedMethod === 'cod' ? '2px solid #F5C400' : '2px solid #2d2d4f',
            backgroundColor: selectedMethod === 'cod' ? 'rgba(245, 196, 0, 0.08)' : '#111122',
            padding: '1.25rem',
            borderRadius: '8px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: disabled ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: selectedMethod === 'cod' ? '0 4px 12px rgba(245, 196, 0, 0.15)' : 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center' }}>🏠</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
              <span style={{ fontWeight: '800', fontSize: '1.05rem', color: '#fff' }}>Cash on Delivery</span>
              <span style={{ fontSize: '0.8rem', color: '#cbd5e0', textAlign: 'left' }}>
                Pay when your order arrives
              </span>
            </div>
          </div>
          {selectedMethod === 'cod' && (
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: '#F5C400',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1a1a2e',
              fontSize: '0.75rem',
              fontWeight: 'bold'
            }}>✓</div>
          )}
        </div>

      </div>
    </div>
  );
}
