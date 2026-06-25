import { useState, useEffect } from 'react';
import { getCarriers } from '../data/carriers';
import { calculateDeliveryDate } from '../utils/deliveryCalculator';
import { isPincodeServiceable } from '../utils/pincodeZones';

const DeliveryBadge = ({ product, cartTotal = 0 }) => {
  const [badge, setBadge] = useState(null);

  useEffect(() => {
    try {
      const savedPincode = localStorage.getItem('wizago_pincode');
      if (!savedPincode || savedPincode.length !== 6) {
        setBadge({ text: "Free delivery available", color: "#00b432", icon: "✅" }); // eslint-disable-line react-hooks/set-state-in-effect
        return;
      }

      if (!isPincodeServiceable(savedPincode)) {
        setBadge({ text: "Check delivery availability", color: "#f5c400" });
        return;
      }

      const carriers = getCarriers();
      const allOptions = [];
      carriers.forEach(carrier => {
        carrier.speeds.forEach(speed => {
          const res = calculateDeliveryDate(carrier, speed, savedPincode, cartTotal);
          if (res.available) allOptions.push(res);
        });
      });

      if (allOptions.length === 0) {
        setBadge({ text: "Check delivery availability", color: "#f5c400" });
        return;
      }

      const freeOptions = allOptions.filter(o => o.isFree);
      if (freeOptions.length > 0) {
        freeOptions.sort((a, b) => a.date - b.date);
        setBadge({
          text: `✅ Free delivery by ${freeOptions[0].label}`,
          color: "#00b432"
        });
      } else {
        const fastest = allOptions.sort((a, b) => a.date - b.date)[0];
        if (fastest && fastest.speedId === "two_hour") {
          setBadge({ text: `${fastest.carrierLogo} 2-hr delivery available`, color: "#dc143c" });
        } else if (fastest) {
          setBadge({ text: `Delivery from ₹${fastest.price}`, color: "#7c3aed" });
        }
      }
    } catch {
      setBadge({ text: "Free delivery available", color: "#00b432" });
    }
  }, [product, cartTotal]);

  if (!badge) return null;

  return (
    <div className="delivery-badge" style={{ color: badge.color }}>
      {badge.icon}
      {badge.text}
    </div>
  );
};

export default DeliveryBadge;
