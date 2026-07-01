import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Coffee, ShieldCheck, Heart, ArrowRight, Lock, CreditCard, Wallet } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const BuyCoffee = () => {
  const { addToast } = useToast();
  
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
      await axios.post("/api/otp/send", { phone });
      setOtpSent(true);
      setLoading(false);

      // Start cooldown
      const baseTime = 30; // first cooldown 30s
      setResendCooldown(baseTime * cooldownMultiplier);
      setCooldownMultiplier(cooldownMultiplier * 2); // next cooldown doubles
    } catch (err) {
      console.error(err);
      setLoading(false);
      addToast("Failed to send OTP. Try again.");
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    if (!otp) return addToast("Please enter OTP");
    try {
      setLoading(true);
      const response = await axios.post("/api/otp/verify", { 
        otp, 
        phone: paymentType === "card" ? cardData.phone : walletData.phone 
      });
      if (response.data.success) {
        setOtpVerified(true);
        setPaymentStatus("success");
        resetAllFields();
      } else {
        addToast("OTP incorrect. Try again.");
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      addToast("OTP verification failed.");
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
    if (!amount || amount < 100) return addToast("Minimum donation is ₹100 💸");

    if (paymentType === "card") {
      const { holderName, phone, accountNumber, cvv, expiry } = cardData;
      if (!holderName || !phone || !accountNumber || !cvv || !expiry)
        return addToast("Please complete all card fields!");
      sendOtp(phone);
    }

    if (paymentType === "wallet") {
      const { upiId, holderName, phone } = walletData;
      if (!upiId || !holderName || !phone)
        return addToast("Please complete all wallet fields!");
      sendOtp(phone);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans overflow-hidden selection:bg-purple-500/20 w-full">
      {/* Animated Background System - Light Theme */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-300/40 rounded-full blur-[120px] animate-blob mix-blend-multiply" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-pink-300/30 rounded-full blur-[140px] animate-blob mix-blend-multiply" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[30%] left-[50%] w-[40%] h-[40%] bg-cyan-200/40 rounded-full blur-[100px] animate-blob mix-blend-multiply" style={{ animationDelay: '4s' }} />
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[60px]" />
      </div>

      <div className="flex-1 flex items-center justify-center z-10 relative p-6">
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/80 border border-white/60 shadow-[0_20px_40px_rgba(0,0,0,0.1)] backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] max-w-lg w-full text-center hover:shadow-[0_20px_50px_rgba(139,92,246,0.15)] transition-shadow"
        >
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">☕ Buy Us a Coffee</h1>
        <p className="text-slate-500 mb-8 font-medium">
          Support <span className="font-extrabold text-purple-600">MediSync-AI</span>.
        </p>

        {/* Payment Type Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            className={`p-3 md:px-6 rounded-xl font-bold transition-all hover:-translate-y-0.5 hover:shadow-md ${paymentType === "card" ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md" : "bg-white text-slate-700 border border-slate-200 hover:border-purple-300 shadow-sm"}`}
            onClick={() => setPaymentType("card")}
          >
            💳 Card
          </button>
          <button
            className={`p-3 md:px-6 rounded-xl font-bold transition-all hover:-translate-y-0.5 hover:shadow-md ${paymentType === "wallet" ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md" : "bg-white text-slate-700 border border-slate-200 hover:border-purple-300 shadow-sm"}`}
            onClick={() => setPaymentType("wallet")}
          >
            📲 Wallet
          </button>
          <button
            className={`p-3 md:px-6 rounded-xl font-bold transition-all hover:-translate-y-0.5 hover:shadow-md ${paymentType === "bank" ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md" : "bg-white text-slate-700 border border-slate-200 hover:border-purple-300 shadow-sm"}`}
            onClick={() => window.open("https://onlinesbi.sbi.bank.in/", "_blank")}
          >
            🏦 Bank
          </button>
        </div>

        {/* Preset Amounts */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {presetAmounts.map((value) => (
            <motion.button
              whileTap={{ scale: 0.95 }}
              key={value}
              onClick={() => handlePreset(value)}
              className={`py-2.5 rounded-xl font-bold transition-all ${amount === value ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md" : "bg-white text-slate-700 border border-slate-200 hover:border-purple-300 hover:text-purple-600 shadow-sm"}`}
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
          className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-slate-900 font-bold bg-white mb-4 shadow-sm placeholder-slate-400 transition-all"
        />

        {/* Optional Message */}
        <textarea
          placeholder="Add a message (optional)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-slate-900 font-medium bg-white resize-none mb-6 shadow-sm placeholder-slate-400 transition-all custom-scrollbar"
          rows={3}
        />

        {/* Card Fields */}
        {paymentType === "card" && !otpSent && (
          <form onSubmit={handlePaymentSubmit} className="space-y-4 mb-6">
            <input type="text" placeholder="Account Holder Name" value={cardData.holderName} onChange={(e) => setCardData({...cardData, holderName: e.target.value})} required className="w-full p-3.5 border border-slate-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium placeholder-slate-400" />
            <input type="text" placeholder="Registered Phone Number" value={cardData.phone} onChange={(e) => setCardData({...cardData, phone: e.target.value})} required className="w-full p-3.5 border border-slate-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium placeholder-slate-400" />
            <input type="text" placeholder="Account Number" value={cardData.accountNumber} onChange={(e) => setCardData({...cardData, accountNumber: e.target.value})} required className="w-full p-3.5 border border-slate-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium placeholder-slate-400" />
            <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="CVV" value={cardData.cvv} onChange={(e) => setCardData({...cardData, cvv: e.target.value})} required className="w-full p-3.5 border border-slate-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium placeholder-slate-400" />
                <input type="text" placeholder="Expiry MM/YY" value={cardData.expiry} onChange={(e) => setCardData({...cardData, expiry: e.target.value})} required className="w-full p-3.5 border border-slate-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium placeholder-slate-400" />
            </div>
            <motion.button whileTap={{ scale: 0.95 }} type="submit" disabled={loading} className={`w-full py-4 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg mt-2 ${loading ? "bg-slate-400 cursor-not-allowed shadow-none" : "bg-gradient-to-r from-purple-600 to-pink-500 hover:-translate-y-0.5"}`}>
              {loading ? "Processing..." : "Pay Now"}
            </motion.button>
          </form>
        )}

        {/* Wallet Fields */}
        {paymentType === "wallet" && !otpSent && (
          <form onSubmit={handlePaymentSubmit} className="space-y-4 mb-6">
            <input type="text" placeholder="UPI ID" value={walletData.upiId} onChange={(e) => setWalletData({...walletData, upiId: e.target.value})} required className="w-full p-3.5 border border-slate-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium placeholder-slate-400" />
            <input type="text" placeholder="Account Holder Name" value={walletData.holderName} onChange={(e) => setWalletData({...walletData, holderName: e.target.value})} required className="w-full p-3.5 border border-slate-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium placeholder-slate-400" />
            <input type="text" placeholder="Phone Number" value={walletData.phone} onChange={(e) => setWalletData({...walletData, phone: e.target.value})} required className="w-full p-3.5 border border-slate-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium placeholder-slate-400" />
            <motion.button whileTap={{ scale: 0.95 }} type="submit" disabled={loading} className={`w-full py-4 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg mt-2 ${loading ? "bg-slate-400 cursor-not-allowed shadow-none" : "bg-gradient-to-r from-purple-600 to-pink-500 hover:-translate-y-0.5"}`}>
              {loading ? "Processing..." : "Pay Now"}
            </motion.button>
          </form>
        )}

        {/* OTP Input */}
        {otpSent && !otpVerified && (
          <div className="space-y-4 mb-6">
            <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-bold text-center tracking-[0.5em] placeholder-slate-400" />
            <motion.button whileTap={{ scale: 0.95 }} onClick={verifyOtp} disabled={loading} className={`w-full py-4 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg ${loading ? "bg-slate-400 cursor-not-allowed shadow-none" : "bg-gradient-to-r from-purple-600 to-pink-500 hover:-translate-y-0.5"}`}>
              {loading ? "Verifying..." : "Verify OTP"}
            </motion.button>

            {/* Resend OTP Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => paymentType === "card" ? sendOtp(cardData.phone) : sendOtp(walletData.phone)}
              disabled={resendCooldown > 0 || loading}
              className={`w-full py-4 mt-2 text-slate-700 bg-white border border-slate-200 rounded-xl font-bold transition-all shadow-sm ${resendCooldown > 0 ? "opacity-50 cursor-not-allowed" : "hover:border-purple-300 hover:text-purple-600 hover:-translate-y-0.5 hover:shadow-md"}`}
            >
              {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
            </motion.button>
          </div>
        )}

        {paymentStatus === "success" && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-600 font-bold mt-4 bg-emerald-50 py-3 rounded-xl border border-emerald-100">✅ Payment successful! Thank you.</motion.p>}
        {paymentStatus === "failed" && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-600 font-bold mt-4 bg-red-50 py-3 rounded-xl border border-red-100">❌ Payment failed. Please try again.</motion.p>}

        <p className="text-sm text-slate-400 mt-6 font-medium">100% of your donation goes directly to <span className="font-extrabold text-slate-600">MediSync-AI</span>.</p>
      </motion.div>
      </div>
    </div>
  );
};

export default BuyCoffee;
