const PINCODE_ZONES = {
  "452": { city: "Indore", state: "Madhya Pradesh", region: "Central India" },
  "462": { city: "Bhopal", state: "Madhya Pradesh", region: "Central India" },
  "474": { city: "Gwalior", state: "Madhya Pradesh", region: "Central India" },
  "482": { city: "Jabalpur", state: "Madhya Pradesh", region: "Central India" },
  "400": { city: "Mumbai", state: "Maharashtra", region: "West India" },
  "411": { city: "Pune", state: "Maharashtra", region: "West India" },
  "440": { city: "Nagpur", state: "Maharashtra", region: "West India" },
  "110": { city: "Delhi", state: "Delhi", region: "North India" },
  "201": { city: "Noida", state: "Uttar Pradesh", region: "North India" },
  "122": { city: "Gurugram", state: "Haryana", region: "North India" },
  "560": { city: "Bangalore", state: "Karnataka", region: "South India" },
  "575": { city: "Mangalore", state: "Karnataka", region: "South India" },
  "600": { city: "Chennai", state: "Tamil Nadu", region: "South India" },
  "641": { city: "Coimbatore", state: "Tamil Nadu", region: "South India" },
  "380": { city: "Ahmedabad", state: "Gujarat", region: "West India" },
  "395": { city: "Surat", state: "Gujarat", region: "West India" },
  "302": { city: "Jaipur", state: "Rajasthan", region: "North India" },
  "342": { city: "Jodhpur", state: "Rajasthan", region: "North India" },
  "500": { city: "Hyderabad", state: "Telangana", region: "South India" },
  "700": { city: "Kolkata", state: "West Bengal", region: "East India" },
  "226": { city: "Lucknow", state: "Uttar Pradesh", region: "North India" },
  "208": { city: "Kanpur", state: "Uttar Pradesh", region: "North India" },
};

export const getPincodeZone = (pincode) => {
  const prefix3 = pincode.substring(0, 3);
  const prefix2 = pincode.substring(0, 2);

  return PINCODE_ZONES[prefix3] ||
         PINCODE_ZONES[prefix2] ||
         {
           city: "Your City",
           state: "India",
           region: "India",
           unknown: true
         };
};

export const isPincodeServiceable = (pincode) => {
  const zone = getPincodeZone(pincode);
  return !zone.unknown;
};
