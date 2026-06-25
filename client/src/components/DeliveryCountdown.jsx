import { useState, useEffect } from 'react';

const DeliveryCountdown = ({ cutoffHour, style }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const cutoff = new Date();
      cutoff.setHours(cutoffHour, 0, 0, 0);

      const diff = cutoff - now;
      if (diff <= 0) {
        setTimeLeft("Cutoff passed");
        clearInterval(timer);
        return;
      }

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      setTimeLeft(`${h} hrs ${m} mins ${s} secs`);
    }, 1000);

    return () => clearInterval(timer);
  }, [cutoffHour]);

  return (
    <span style={{ color: "#DC2626", fontWeight: 500, ...style }}>
      Order within {timeLeft}
    </span>
  );
};

export default DeliveryCountdown;
