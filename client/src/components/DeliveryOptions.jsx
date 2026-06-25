import { useState, useEffect } from 'react';
import { getCarriers } from '../data/carriers';
import { calculateDeliveryDate, getDefaultDeliveryOption } from '../utils/deliveryCalculator';
import { isPincodeServiceable } from '../utils/pincodeZones';
import DeliveryCountdown from './DeliveryCountdown';

const DeliveryOptions = ({ pincode, cartTotal = 0, onSelect, selectedOption }) => {
  const [allResults, setAllResults] = useState([]);
  const [grouped, setGrouped] = useState({});

  useEffect(() => {
    if (!pincode || pincode.length !== 6) return;

    if (!isPincodeServiceable(pincode)) return;

    const carriers = getCarriers();
    const results = [];
    carriers.forEach(carrier => {
      carrier.speeds.forEach(speed => {
        const res = calculateDeliveryDate(carrier, speed, pincode, cartTotal);
        if (res.available) {
          results.push(res);
        }
      });
    });

    setAllResults(results); // eslint-disable-line react-hooks/set-state-in-effect

    const g = {};
    results.forEach(r => {
      if (!g[r.carrierId]) {
        g[r.carrierId] = { name: r.carrier, logo: r.carrierLogo, color: r.carrierColor, options: [] };
      }
      g[r.carrierId].options.push(r);
    });
    setGrouped(g);

    if (!selectedOption) {
      const def = getDefaultDeliveryOption(results);
      if (def && onSelect) onSelect(def);
    }
  }, [pincode, cartTotal, onSelect, selectedOption]);

  if (!pincode || pincode.length !== 6) {
    return (
      <div className="delivery-options-section">
        <div className="delivery-options-title">📦 DELIVERY OPTIONS</div>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          Enter your pincode above to see delivery options
        </p>
      </div>
    );
  }

  if (!isPincodeServiceable(pincode)) return null;

  const hasResults = Object.keys(grouped).length > 0;
  if (!hasResults) return null;

  const findSpeedWithCutoff = (carrier, speedId) => {
    const carrierData = getCarriers().find(c => c.id === carrier);
    if (!carrierData) return null;
    return carrierData.speeds.find(s => s.id === speedId);
  };

  const isFastestOption = (opt) => {
    const freeAvailable = allResults.filter(r => r.available && r.isFree);
    if (freeAvailable.length === 0) return false;
    freeAvailable.sort((a, b) => a.date - b.date);
    return opt.carrierId === freeAvailable[0].carrierId && opt.speedId === freeAvailable[0].speedId;
  };

  const isBestValue = (opt) => {
    if (opt.isFree) return false;
    const paid = allResults.filter(r => r.available && !r.isFree);
    if (paid.length <= 1) return false;
    paid.sort((a, b) => a.price - b.price);
    return opt.carrierId === paid[0].carrierId && opt.speedId === paid[0].speedId;
  };

  return (
    <div className="delivery-options-section">
      <div className="delivery-options-title">📦 CHOOSE DELIVERY PARTNER & SPEED</div>
      {Object.entries(grouped).map(([carrierId, group]) => {
        if (group.options.length === 0) return null;
        return (
          <div key={carrierId} className="delivery-carrier-block">
            <div className="delivery-carrier-header" style={{ color: group.color }}>
              {group.logo} {group.name}
            </div>
            <div className="delivery-carrier-options">
              {group.options.map((opt) => {
                const isSelected = selectedOption &&
                  selectedOption.carrierId === opt.carrierId &&
                  selectedOption.speedId === opt.speedId;
                const speedDef = findSpeedWithCutoff(opt.carrierId, opt.speedId);
                return (
                  <div
                    key={`${opt.carrierId}-${opt.speedId}`}
                    className={`delivery-opt-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => onSelect && onSelect(opt)}
                  >
                    <div className="delivery-opt-top">
                      <span className="delivery-opt-radio">{isSelected ? '●' : '○'}</span>
                      <span className="delivery-opt-label">{opt.speedLabel}</span>
                      <span className="delivery-opt-price">{opt.isFree ? 'FREE' : `₹${opt.price}`}</span>
                    </div>
                    <div className="delivery-opt-date">{opt.label}</div>
                    {opt.speedId === 'same_day' && opt.available && speedDef && (
                      <DeliveryCountdown cutoffHour={speedDef.cutoffHour} style={{ fontSize: '0.75rem' }} />
                    )}
                    {opt.speedId === 'two_hour' && opt.available && (
                      <DeliveryCountdown cutoffHour={12} style={{ fontSize: '0.75rem' }} />
                    )}
                    <div className="delivery-opt-badges">
                      {isFastestOption(opt) && <span className="badge-fastest">★ Fastest option</span>}
                      {isBestValue(opt) && <span className="badge-best-value">Best Value</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DeliveryOptions;
