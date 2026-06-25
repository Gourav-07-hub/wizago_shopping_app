import { getPincodeZone } from './pincodeZones';

const formatTime = (h, m) => {
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h > 12 ? h - 12 : h;
  return `${hour}:${m.toString().padStart(2, "0")} ${suffix}`;
};

const formatDate = (d) => {
  const months = ["Jan","Feb","Mar","Apr","May","Jun",
                  "Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d.getDate()} ${months[d.getMonth()]}`;
};

const formatDayDate = (d) => {
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return `${days[d.getDay()]}, ${formatDate(d)}`;
};

const formatDeliveryLabel = (date) => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow, " + formatDate(date);
  }
  return formatDayDate(date);
};

export const calculateDeliveryDate = (carrier, speed, pincode, cartTotal = 0) => {
  const now = new Date();
  const currentHour = now.getHours();
  let deliveryDate;
  let label;

  if (speed.availableZones) {
    const zone = getPincodeZone(pincode);
    if (!speed.availableZones.includes(zone.city)) {
      return { available: false, reason: "Not available in your area" };
    }
  }

  if (speed.id === "same_day") {
    if (currentHour >= speed.cutoffHour) {
      return {
        available: false,
        reason: "Order by 12 PM for same day delivery"
      };
    }
    deliveryDate = new Date();
    label = "Today by 9 PM";
  } else if (speed.id === "two_hour") {
    deliveryDate = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const h = deliveryDate.getHours();
    const m = deliveryDate.getMinutes();
    label = `Today by ${formatTime(h, m)}`;
  } else if (speed.id === "four_hour") {
    deliveryDate = new Date(now.getTime() + 4 * 60 * 60 * 1000);
    const h = deliveryDate.getHours();
    const m = deliveryDate.getMinutes();
    label = `Today by ${formatTime(h, m)}`;
  } else {
    let daysToAdd = speed.days;
    if (currentHour >= 17) daysToAdd += 1;

    let d = new Date();
    let added = 0;
    while (added < daysToAdd) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0) added++;
    }

    deliveryDate = d;
    label = formatDeliveryLabel(d);
  }

  const isFree = speed.price === 0 ||
                 (speed.freeAbove !== null && speed.freeAbove !== undefined && cartTotal >= speed.freeAbove);

  return {
    available: true,
    date: deliveryDate,
    label,
    price: isFree ? 0 : speed.price,
    isFree,
    carrier: carrier.name,
    carrierLogo: carrier.logo,
    carrierColor: carrier.color,
    speedLabel: speed.label,
    speedId: speed.id,
    carrierId: carrier.id,
  };
};

export const getDefaultDeliveryOption = (results) => {
  const available = results.filter(r => r.available);
  if (available.length === 0) return null;

  const free = available.filter(r => r.isFree);
  if (free.length > 0) {
    free.sort((a, b) => a.date - b.date);
    return free[0];
  }

  available.sort((a, b) => a.price - b.price);
  return available[0];
};
