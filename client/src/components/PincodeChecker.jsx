import { useState, useEffect, useRef } from 'react';
import { getCarriers } from '../data/carriers';
import { calculateDeliveryDate } from '../utils/deliveryCalculator';
import { isPincodeServiceable, getPincodeZone } from '../utils/pincodeZones';
import DeliveryCountdown from './DeliveryCountdown';

const PincodeChecker = ({ cartTotal = 0, compact = false, onDeliverySelect }) => {
  const [pincode, setPincode] = useState(() => {
    return localStorage.getItem('wizago_pincode') || '';
  });
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState([]);
  const [zone, setZone] = useState(null);
  const [valid, setValid] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('wizago_pincode');
    if (saved) {
      setPincode(saved); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, []);

  const handlePincodeChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(val);
    setChecked(false);
    if (val.length === 6) {
      setValid(isPincodeServiceable(val));
    } else {
      setValid(false);
    }
  };

  const handleCheck = () => {
    if (pincode.length !== 6) return;

    const codeValid = isPincodeServiceable(pincode);
    setValid(codeValid);

    if (codeValid) {
      localStorage.setItem('wizago_pincode', pincode);
      const zoneInfo = getPincodeZone(pincode);
      setZone(zoneInfo);

      const carriers = getCarriers();
      const allResults = [];
      carriers.forEach(carrier => {
        carrier.speeds.forEach(speed => {
          const res = calculateDeliveryDate(carrier, speed, pincode, cartTotal);
          allResults.push(res);
        });
      });
      setResults(allResults);

      const available = allResults.filter(r => r.available);
      const freeSorted = available.filter(r => r.isFree).sort((a, b) => a.date - b.date);
      const defaultOpt = freeSorted.length > 0 ? freeSorted[0]
        : available.sort((a, b) => a.price - b.price)[0];

      if (defaultOpt) {
        setSelectedOption(defaultOpt);
        if (onDeliverySelect) onDeliverySelect(defaultOpt);
      }
    }
    setChecked(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleCheck();
  };

  const handleSelect = (opt) => {
    setSelectedOption(opt);
    if (onDeliverySelect) onDeliverySelect(opt);
  };

  const handleResetPincode = () => {
    setPincode('');
    setChecked(false);
    setResults([]);
    setZone(null);
    setSelectedOption(null);
    localStorage.removeItem('wizago_pincode');
    if (inputRef.current) inputRef.current.focus();
  };

  const groupedByCarrier = {};
  results.forEach(r => {
    const key = r.carrierId;
    if (!groupedByCarrier[key]) {
      groupedByCarrier[key] = { name: r.carrier, logo: r.carrierLogo, color: r.carrierColor, options: [] };
    }
    groupedByCarrier[key].options.push(r);
  });

  const renderResults = () => {
    if (pincode.length < 6) return null;
    if (!checked) {
      if (valid) {
        return <div className="pincode-hint">Press Check to see delivery options</div>;
      }
      return null;
    }
    if (!valid) {
      return (
        <div className="pincode-unavailable">
          ❌ Sorry! Delivery is not available to {pincode} yet.
          <button className="pincode-reset-btn" onClick={handleResetPincode}>Try another pincode</button>
        </div>
      );
    }

    return (
      <div className="pincode-results">
        <div className="pincode-serviceable">
          ✅ Delivery available to {pincode}{zone ? ` - ${zone.city}` : ''}
        </div>
        {Object.entries(groupedByCarrier).map(([carrierId, group]) => {
          const available = group.options.filter(o => o.available);
          if (available.length === 0) return null;
          return (
            <div key={carrierId} className="carrier-group">
              <div className="carrier-group-header" style={{ color: group.color }}>
                {group.logo} {group.name}
              </div>
              <div className="carrier-speeds">
                {available.map((opt, idx) => {
                  const isSelected = selectedOption && selectedOption.carrierId === opt.carrierId && selectedOption.speedId === opt.speedId;
                  const isFastest = available.length > 1 && idx === 0 && opt.isFree && opt.price === 0;
                  return (
                    <div
                      key={`${opt.carrierId}-${opt.speedId}`}
                      className={`delivery-option-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelect(opt)}
                    >
                      <div className="delivery-option-row">
                        <span className="delivery-option-radio">{isSelected ? '●' : '○'}</span>
                        <span className="delivery-option-label">{opt.speedLabel}</span>
                        <span className="delivery-option-price">
                          {opt.isFree ? 'FREE' : `₹${opt.price}`}
                        </span>
                      </div>
                      <div className="delivery-option-date">{opt.label}</div>
                      {opt.speedId === 'same_day' && opt.available && (
                        <DeliveryCountdown cutoffHour={12} />
                      )}
                      {isFastest && <span className="badge-fastest">★ Fastest option</span>}
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

  if (compact) {
    return (
      <div className="pincode-checker-compact">
        <div className="pincode-input-row">
          <span>📍</span>
          <input
            ref={inputRef}
            type="text"
            className="pincode-input"
            placeholder="Enter pincode"
            value={pincode}
            onChange={handlePincodeChange}
            onKeyDown={handleKeyDown}
            maxLength={6}
          />
          <button className="pincode-check-btn" onClick={handleCheck}>Check</button>
        </div>
        {renderResults()}
      </div>
    );
  }

  return (
    <div className="pincode-checker">
      <div className="pincode-header">📍 DELIVERY OPTIONS</div>
      <div className="pincode-input-row">
        <input
          ref={inputRef}
          type="text"
          className="pincode-input"
          placeholder="Enter pincode to check delivery date"
          value={pincode}
          onChange={handlePincodeChange}
          onKeyDown={handleKeyDown}
          maxLength={6}
        />
        <button className="pincode-check-btn" onClick={handleCheck}>Check</button>
      </div>
      {renderResults()}
    </div>
  );
};

export default PincodeChecker;
