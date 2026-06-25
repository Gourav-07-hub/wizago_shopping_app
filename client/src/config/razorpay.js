export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

if (!RAZORPAY_KEY_ID) {
  console.error(
    "Razorpay Key ID is missing. Add VITE_RAZORPAY_KEY_ID to your .env file."
  );
}
