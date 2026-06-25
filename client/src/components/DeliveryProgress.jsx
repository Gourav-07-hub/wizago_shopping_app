const STAGES = [
  { key: 'order_placed', label: 'Order Placed', pct: 0 },
  { key: 'packed', label: 'Packed', pct: 33 },
  { key: 'out_for_delivery', label: 'Out for Delivery', pct: 66 },
  { key: 'delivered', label: 'Delivered', pct: 100 },
];

const DeliveryProgress = ({ deliveryStatus = 'order_placed', timeline = [] }) => {
  const currentStatus = deliveryStatus === 'cancelled' ? 'order_placed' : deliveryStatus;
  const stageIndex = STAGES.findIndex(s => s.key === currentStatus);
  const currentStage = stageIndex >= 0 ? STAGES[stageIndex] : STAGES[0];
  const progressPct = currentStage ? currentStage.pct : 0;

  const getTimestamp = (stageKey) => {
    const entry = timeline.find(t => {
      const ev = t.event?.toLowerCase() || '';
      return ev.includes(stageKey.replace(/_/g, ' ')) || ev.includes(STAGES.find(s => s.key === stageKey)?.label.toLowerCase() || '');
    });
    return entry ? new Date(entry.timestamp).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }) : null;
  };

  return (
    <div className="delivery-progress">
      <div className="delivery-progress-bar">
        <div className="delivery-progress-fill" style={{ width: `${progressPct}%` }} />
      </div>
      <div className="delivery-progress-stages">
        {STAGES.map((stage, idx) => {
          const isActive = stageIndex >= idx;
          const isCurrent = stageIndex === idx;
          const ts = getTimestamp(stage.key);
          return (
            <div
              key={stage.key}
              className={`delivery-stage ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}
            >
              <div className="delivery-stage-dot" />
              <div className="delivery-stage-label">{stage.label}</div>
              {ts && <div className="delivery-stage-time">{ts}</div>}
            </div>
          );
        })}
      </div>
      {deliveryStatus === 'cancelled' && (
        <div className="delivery-cancelled">🔴 Order Cancelled</div>
      )}
    </div>
  );
};

export default DeliveryProgress;
