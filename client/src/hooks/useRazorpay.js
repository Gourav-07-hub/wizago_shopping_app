import { useState } from 'react';
import { RAZORPAY_KEY_ID } from '../config/razorpay';

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export function useRazorpay() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRazorpayPayment = async ({
    orderId,
    grandTotal,
    customerName,
    customerEmail,
    customerPhone,
    deliveryAddress,
    onSuccess,
    onFailed,
    onDismiss
  }) => {
    setIsProcessing(true);
    const scriptLoaded = await loadRazorpayScript();
    
    if (!scriptLoaded) {
      alert("Payment service unavailable. Please try again.");
      setIsProcessing(false);
      return;
    }

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: Math.round(grandTotal * 100), // Razorpay accepts amount in PAISE (₹544.96 → 54496 paise)
      currency: "INR",
      name: "Wizago Shop",
      description: `Order #${orderId}`,
      image: "/favicon.svg",
      
      prefill: {
        name: customerName,
        email: customerEmail,
        contact: "+91" + customerPhone,
      },
      
      notes: {
        order_id: orderId,
        address: deliveryAddress,
      },
      
      theme: {
        color: "#F5C400", // Wizago yellow
      },
      
      handler: function (response) {
        setIsProcessing(false);
        if (onSuccess) onSuccess(response);
      },
      
      modal: {
        ondismiss: function () {
          setIsProcessing(false);
          if (onDismiss) onDismiss();
        }
      }
    };

    const rzp = new window.Razorpay(options);
    
    rzp.on("payment.failed", function (response) {
      setIsProcessing(false);
      if (onFailed) onFailed(response);
    });
    
    rzp.open();
  };

  return {
    isProcessing,
    setIsProcessing,
    handleRazorpayPayment
  };
}
