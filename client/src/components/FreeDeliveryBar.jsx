const FreeDeliveryBar = ({ cartTotal, threshold = 500 }) => {
  if (cartTotal <= 0) return null;

  const remaining = Math.max(0, threshold - cartTotal);
  const progress = Math.min(100, (cartTotal / threshold) * 100);

  return (
    <div className="free-delivery-bar">
      {remaining > 0 ? (
        <>
          <div className="free-delivery-text">
            🎁 Add <strong>₹{remaining.toFixed(2)}</strong> more for <strong>FREE delivery</strong>!
          </div>
          <div className="free-delivery-progress-track">
            <div
              className="free-delivery-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="free-delivery-progress-label">
            ₹{cartTotal.toFixed(2)} / ₹{threshold}
          </div>
        </>
      ) : (
        <div className="free-delivery-text green">
          ✅ You got <strong>FREE delivery</strong>!
        </div>
      )}
    </div>
  );
};

export default FreeDeliveryBar;
