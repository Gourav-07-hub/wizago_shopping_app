export const DEFAULT_CARRIERS = [
  {
    id: "WZ-SWIFT",
    name: "WizagoSwift",
    tagline: "Lightning fast deliveries",
    logo: "⚡",
    color: "#F5C400",
    speeds: [
      {
        id: "standard",
        label: "Standard Delivery",
        days: 5,
        price: 0,
        freeAbove: 500,
        description: "Delivered in 4-6 business days"
      },
      {
        id: "express",
        label: "Express Delivery",
        days: 2,
        price: 99,
        freeAbove: null,
        description: "Delivered in 1-2 business days"
      },
      {
        id: "same_day",
        label: "Same Day Delivery",
        days: 0,
        price: 199,
        freeAbove: null,
        description: "Order before 12 PM, get it today",
        cutoffHour: 12,
        availableZones: ["Indore", "Bhopal", "Mumbai", "Delhi"]
      }
    ]
  },
  {
    id: "WZ-CARGO",
    name: "WizagoCargo",
    tagline: "Safe & secure for heavy items",
    logo: "📦",
    color: "#2563EB",
    speeds: [
      {
        id: "standard",
        label: "Standard Delivery",
        days: 7,
        price: 0,
        freeAbove: 500,
        description: "Delivered in 6-8 business days"
      },
      {
        id: "express",
        label: "Express Delivery",
        days: 3,
        price: 149,
        freeAbove: null,
        description: "Delivered in 2-3 business days"
      }
    ]
  },
  {
    id: "WZ-INSTANT",
    name: "WizagoInstant",
    tagline: "Hyperlocal 2-hour delivery",
    logo: "🚀",
    color: "#DC2626",
    speeds: [
      {
        id: "two_hour",
        label: "2-Hour Delivery",
        days: 0,
        price: 299,
        freeAbove: null,
        description: "Delivered within 2 hours",
        availableZones: ["Indore", "Mumbai", "Delhi", "Bangalore"]
      },
      {
        id: "four_hour",
        label: "4-Hour Delivery",
        days: 0,
        price: 199,
        freeAbove: null,
        description: "Delivered within 4 hours",
        availableZones: ["Indore", "Mumbai", "Delhi", "Bangalore",
                         "Pune", "Hyderabad"]
      }
    ]
  },
  {
    id: "WZ-ECO",
    name: "WizagoEco",
    tagline: "Green delivery, zero carbon",
    logo: "🌱",
    color: "#16A34A",
    speeds: [
      {
        id: "standard",
        label: "Eco Standard",
        days: 6,
        price: 0,
        freeAbove: 300,
        description: "Delivered in 5-7 business days"
      },
      {
        id: "express",
        label: "Eco Express",
        days: 3,
        price: 79,
        freeAbove: null,
        description: "Delivered in 2-4 business days"
      }
    ]
  }
];

export const getCarriers = () => {
  try {
    const stored = localStorage.getItem('wizago_carriers');
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  localStorage.setItem('wizago_carriers', JSON.stringify(DEFAULT_CARRIERS));
  return DEFAULT_CARRIERS;
};
