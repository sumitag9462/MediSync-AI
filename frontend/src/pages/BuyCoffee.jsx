import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const BuyCoffee = () => {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentType, setPaymentType] = useState(null); // 'card', 'wallet', 'bank'

  const [cardData, setCardData] = useState({
    holderName: "",
    phone: "",
    accountNumber: "",
    cvv: "",
    expiry: "",
  });

  const [walletData, setWalletData] = useState({
    upiId: "",
    holderName: "",
    phone: "",
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const [resendCooldown, setResendCooldown] = useState(0);
  const [cooldownMultiplier, setCooldownMultiplier] = useState(1);

  const presetAmounts = [100, 200, 500, 1000];

  const handlePreset = (value) => setAmount(value);

  // Countdown effect for resend OTP
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Send OTP
  const sendOtp = async (phone) => {
    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/otp/send", { phone });
      setOtpSent(true);
      setLoading(false);

      // Start cooldown
      const baseTime = 30; // first cooldown 30s
      setResendCooldown(baseTime * cooldownMultiplier);
      setCooldownMultiplier(cooldownMultiplier * 2); // next cooldown doubles
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Failed to send OTP. Try again.");
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    if (!otp) return alert("Please enter OTP");
    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/api/otp/verify", { 
        otp, 
        phone: paymentType === "card" ? cardData.phone : walletData.phone 
      });
      if (response.data.success) {
        setOtpVerified(true);
        setPaymentStatus("success");
        resetAllFields();
      } else {
        alert("OTP incorrect. Try again.");
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("OTP verification failed.");
    }
  };

  const resetAllFields = () => {
    setAmount("");
    setMessage("");
    setPaymentType(null);
    setCardData({
      holderName: "",
      phone: "",
      accountNumber: "",
      cvv: "",
      expiry: "",
    });
    setWalletData({
      upiId: "",
      holderName: "",
      phone: "",
    });
    setOtp("");
    setOtpSent(false);
    setOtpVerified(false);
    setResendCooldown(0);
    setCooldownMultiplier(1);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!amount || amount < 100) return alert("Minimum donation is ₹100 💸");

    if (paymentType === "card") {
      const { holderName, phone, accountNumber, cvv, expiry } = cardData;
      if (!holderName || !phone || !accountNumber || !cvv || !expiry)
        return alert("Please complete all card fields!");
      sendOtp(phone);
    }

    if (paymentType === "wallet") {
      const { upiId, holderName, phone } = walletData;
      if (!upiId || !holderName || !phone)
        return alert("Please complete all wallet fields!");
      sendOtp(phone);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5EFFF] to-[#E0C3FC] p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-lg w-full text-center"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-4">☕ Buy Us a Coffee</h1>
        <p className="text-gray-600 mb-6">
          Support <span className="font-semibold text-purple-500">MedWell</span>.
        </p>

        {/* Payment Type Buttons */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            className={`p-3 rounded-xl ${paymentType === "card" ? "bg-purple-600 text-white" : "bg-gray-100"}`}
            onClick={() => setPaymentType("card")}
          >
            💳 Card
          </button>
          <button
            className={`p-3 rounded-xl ${paymentType === "wallet" ? "bg-purple-600 text-white" : "bg-gray-100"}`}
            onClick={() => setPaymentType("wallet")}
          >
            📲 Wallet
          </button>
          <button
            className={`p-3 rounded-xl ${paymentType === "bank" ? "bg-purple-600 text-white" : "bg-gray-100"}`}
            onClick={() => window.open("https://onlinesbi.sbi.bank.in/", "_blank")}
          >
            🏦 Bank
          </button>
        </div>

        {/* Preset Amounts */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {presetAmounts.map((value) => (
            <motion.button
              whileTap={{ scale: 0.95 }}
              key={value}
              onClick={() => handlePreset(value)}
              className={`py-2 rounded-xl font-semibold ${amount === value ? "bg-purple-600 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-purple-100"}`}
            >
              ₹{value}
            </motion.button>
          ))}
        </div>

        {/* Custom Amount */}
        <input
          type="number"
          placeholder="Enter custom amount (₹)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-400 outline-none text-gray-700 mb-4"
        />

        {/* Optional Message */}
        <textarea
          placeholder="Add a message (optional)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-400 outline-none text-gray-700 resize-none mb-4"
          rows={3}
        />

        {/* Card Fields */}
        {paymentType === "card" && !otpSent && (
          <form onSubmit={handlePaymentSubmit} className="space-y-3 mb-4">
            <input type="text" placeholder="Account Holder Name" value={cardData.holderName} onChange={(e) => setCardData({...cardData, holderName: e.target.value})} required className="w-full p-3 border rounded-xl" />
            <input type="text" placeholder="Registered Phone Number" value={cardData.phone} onChange={(e) => setCardData({...cardData, phone: e.target.value})} required className="w-full p-3 border rounded-xl" />
            <input type="text" placeholder="Account Number" value={cardData.accountNumber} onChange={(e) => setCardData({...cardData, accountNumber: e.target.value})} required className="w-full p-3 border rounded-xl" />
            <input type="text" placeholder="CVV" value={cardData.cvv} onChange={(e) => setCardData({...cardData, cvv: e.target.value})} required className="w-full p-3 border rounded-xl" />
            <input type="text" placeholder="Expiry MM/YY" value={cardData.expiry} onChange={(e) => setCardData({...cardData, expiry: e.target.value})} required className="w-full p-3 border rounded-xl" />
            <motion.button whileTap={{ scale: 0.95 }} type="submit" disabled={loading} className={`w-full py-3 text-white rounded-xl font-semibold transition ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:opacity-90"}`}>
              {loading ? "Processing..." : "Pay Now"}
            </motion.button>
          </form>
        )}

        {/* Wallet Fields */}
        {paymentType === "wallet" && !otpSent && (
          <form onSubmit={handlePaymentSubmit} className="space-y-3 mb-4">
            <input type="text" placeholder="UPI ID" value={walletData.upiId} onChange={(e) => setWalletData({...walletData, upiId: e.target.value})} required className="w-full p-3 border rounded-xl" />
            <input type="text" placeholder="Account Holder Name" value={walletData.holderName} onChange={(e) => setWalletData({...walletData, holderName: e.target.value})} required className="w-full p-3 border rounded-xl" />
            <input type="text" placeholder="Phone Number" value={walletData.phone} onChange={(e) => setWalletData({...walletData, phone: e.target.value})} required className="w-full p-3 border rounded-xl" />
            <motion.button whileTap={{ scale: 0.95 }} type="submit" disabled={loading} className={`w-full py-3 text-white rounded-xl font-semibold transition ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:opacity-90"}`}>
              {loading ? "Processing..." : "Pay Now"}
            </motion.button>
          </form>
        )}

        {/* OTP Input */}
        {otpSent && !otpVerified && (
          <div className="space-y-3 mb-4">
            <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full p-3 border rounded-xl" />
            <motion.button whileTap={{ scale: 0.95 }} onClick={verifyOtp} disabled={loading} className={`w-full py-3 text-white rounded-xl font-semibold transition ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:opacity-90"}`}>
              {loading ? "Verifying..." : "Verify OTP"}
            </motion.button>

            {/* Resend OTP Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => paymentType === "card" ? sendOtp(cardData.phone) : sendOtp(walletData.phone)}
              disabled={resendCooldown > 0 || loading}
              className={`w-full py-3 mt-2 text-white rounded-xl font-semibold transition ${resendCooldown > 0 ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:shadow-lg hover:opacity-90"}`}
            >
              {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
            </motion.button>
          </div>
        )}

        {paymentStatus === "success" && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-600 font-semibold mt-2">✅ Payment successful! Thank you.</motion.p>}
        {paymentStatus === "failed" && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 font-semibold mt-2">❌ Payment failed. Please try again.</motion.p>}

        <p className="text-sm text-gray-500 mt-4">100% of your donation goes to <span className="font-medium">MedWell</span>.</p>
      </motion.div>
    </div>
  );
};

export default BuyCoffee;
