"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  MapPin, 
  CheckCircle2, 
  ArrowLeft,
  Lock,
  Zap,
  ShoppingCart,
  QrCode,
  Banknote,
  Smartphone,
  User,
  Building2,
  Hash,
  Ticket,
  XCircle,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white space-y-4">
         <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
         <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Securing Checkout Protocol...</p>
       </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');

  const [product, setProduct] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Cart, 2: Details, 3: Payment, 4: Confirm

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    pincode: ''
  });

  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY'); // RAZORPAY, COD, UPI
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  useEffect(() => {
    const userStr = localStorage.getItem('nexis_user');
    if (!userStr) {
      toast.error("Authentication required for secure transactions.");
      router.push('/login?redirect=/checkout');
      return;
    }

    const loadData = async () => {
      try {
        const user = JSON.parse(userStr);
        setFormData({
          fullName: user.name || '',
          phone: user.mobilePhone || user.phoneNumber || '',
          address: user.address || '',
          city: '',
          pincode: ''
        });

        if (productId) {
          const res = await fetch(`${API_URL}/api/products/${productId}`);
          if (res.ok) setProduct(await res.json());
          else router.push('/');
        } else {
          const savedCart = localStorage.getItem('nexis_cart');
          if (savedCart) setCart(JSON.parse(savedCart));
          else router.push('/');
        }
      } catch (err) {
        toast.error("Failed to sync transaction data.");
      } finally {
        setLoading(false);
      }
    };
    loadData();

    // Load Razorpay Script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
         document.body.removeChild(script);
      }
    };
  }, [productId, router, API_URL]);

  const originalTotal = product ? product.price : cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const finalTotal = originalTotal - discountAmount;

  const handleApplyCoupon = () => {
    if (appliedCoupon) {
      toast.error("Registry already utilizing a discount protocol.");
      return;
    }

    if (couponInput.toUpperCase() === 'NEW10') {
      const discount = Math.floor(originalTotal * 0.1);
      setDiscountAmount(discount);
      setAppliedCoupon('NEW10');
      toast.success("Coupon applied successfully!", {
        icon: '🎟️',
        style: { borderRadius: '15px', background: '#0f172a', color: '#fff', fontSize: '12px', fontWeight: 'bold' }
      });
      setCouponInput('');
    } else {
      toast.error("Invalid coupon code", {
        style: { borderRadius: '15px', background: '#fff', color: '#e11d48', fontSize: '12px', fontWeight: 'bold' }
      });
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    toast.success("Coupon protocol terminated.");
  };

  const processRazorpay = async () => {
    setSubmitting(true);
    try {
      const orderRes = await fetch(`${API_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalTotal })
      });

      if (!orderRes.ok) throw new Error("Payment initialization failed.");
      const razorpayOrder = await orderRes.json();

      const options = {
        key: razorpayOrder.key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Nexis Marketplace",
        description: "Transaction for Order #" + razorpayOrder.id.slice(-6),
        order_id: razorpayOrder.id,
        handler: async (response: any) => {
          await handleCheckout(response.razorpay_payment_id);
        },
        prefill: {
          contact: formData.phone,
          email: JSON.parse(localStorage.getItem('nexis_user') || '{}').email
        },
        theme: { color: "#4f46e5" }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        toast.error("Payment Failed: " + resp.error.description);
        setSubmitting(false);
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate payment engine.");
      setSubmitting(false);
    }
  };

  const handleCheckout = async (paymentId: string = "COD") => {
    setSubmitting(true);
    const user = JSON.parse(localStorage.getItem('nexis_user') || '{}');
    const authToken = user?.token;

    try {
      let response;
      const orderPayload = {
        address: `${formData.address}, ${formData.city} - ${formData.pincode}`,
        phone: formData.phone,
        paymentMethod: paymentMethod === 'RAZORPAY' ? 'ONLINE_PAYMENT' : paymentMethod,
        paymentTransactionId: paymentId,
        serviceType: "PRODUCT_PURCHASE",
        quantity: 1,
        // We'd ideally send the final amount or coupon to the backend
        amount: finalTotal 
      };

      if (productId && product) {
        response = await fetch(`${API_URL}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
          body: JSON.stringify({ ...orderPayload, itemId: product.id })
        });
      } else {
        const productIds = cart.flatMap(item => Array(item.quantity).fill(item.id));
        response = await fetch(`${API_URL}/api/orders/checkout-cart`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
          body: JSON.stringify({ ...orderPayload, productIds })
        });
      }

      if (response.ok) {
        if (!productId) localStorage.removeItem('nexis_cart');
        toast.success("Order Placed Successfully!");
        router.push('/checkout/success');
      } else {
        const errData = await response.json();
        toast.error(errData.message || "Order placement rejected.");
      }
    } catch (error) {
      toast.error("Network communication error.");
    } finally {
      setSubmitting(false);
    }
  };

  const validateDetails = () => {
     if(!formData.fullName || !formData.phone || !formData.address || !formData.city || !formData.pincode) {
        toast.error("Please complete all shipping metrics.");
        return false;
     }
     if(!/^\d{6}$/.test(formData.pincode)) {
        toast.error("Invalid Pincode protocol. Must be 6 digits.");
        return false;
     }
     return true;
  };

  if (loading) return null;

  const steps = [
    { id: 1, name: 'Review', icon: <ShoppingCart size={18} /> },
    { id: 2, name: 'Metrics', icon: <MapPin size={18} /> },
    { id: 3, name: 'Protocol', icon: <CreditCard size={18} /> },
    { id: 4, name: 'Execute', icon: <ShieldCheck size={18} /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-24 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Progress Protocol */}
        <div className="w-full max-w-4xl mx-auto mb-20">
          <div className="flex justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>
            {steps.map((s) => (
              <div key={s.id} className="relative z-10 flex flex-col items-center group cursor-pointer" onClick={() => s.id < step && setStep(s.id)}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl ${step >= s.id ? 'bg-slate-950 text-white shadow-slate-900/20 rotate-0' : 'bg-white text-slate-400 border border-slate-200 rotate-12'}`}>
                  {step > s.id ? <CheckCircle2 size={24} /> : s.icon}
                </div>
                <span className={`mt-4 text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${step >= s.id ? 'text-slate-950' : 'text-slate-400'}`}>{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Main Command Area */}
          <div className="lg:col-span-7 space-y-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="glass-card p-10 bg-white">
                  <h2 className="text-3xl font-black text-slate-950 mb-8 uppercase italic tracking-tighter">Inventory Analysis</h2>
                  <div className="space-y-6 mb-10">
                    {product ? (
                      <div className="flex gap-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 group">
                        <div className="w-28 h-28 bg-white rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100 shadow-sm p-4">
                          <img src={product.imageUrl} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" alt={product.name} />
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <p className="font-black text-xl text-slate-950 leading-tight">{product.name}</p>
                          <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mt-2">{product.category} • {product.conditionGrade}</p>
                          <p className="text-slate-950 font-black text-2xl mt-3 tracking-tighter">₹{product.price.toLocaleString()}</p>
                        </div>
                      </div>
                    ) : cart.map((item, idx) => (
                      <div key={idx} className="flex gap-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 group">
                        <div className="w-28 h-28 bg-white rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100 shadow-sm p-4">
                          <img src={item.imageUrl} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" alt={item.name} />
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-xl text-slate-950 leading-tight">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Quantity: {item.quantity}</p>
                          <p className="text-slate-950 font-black text-2xl mt-3 tracking-tighter">₹{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setStep(2)} className="w-full py-6 rounded-2xl bg-slate-950 text-white font-black uppercase tracking-[0.2em] text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98]">Initialize Metrics</button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="glass-card p-10 bg-white shadow-premium">
                  <h2 className="text-3xl font-black text-slate-950 mb-10 uppercase italic tracking-tighter">Logistics Metrics</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2">
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Personnel Full Name</label>
                       <div className="relative group">
                          <User size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                          <input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full pl-16 pr-6 py-5 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 outline-none font-bold text-slate-950 transition-all" placeholder="Enter Full Legal Name" />
                       </div>
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Comms Channel (Phone)</label>
                       <div className="relative group">
                          <Smartphone size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                          <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full pl-16 pr-6 py-5 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 outline-none font-bold text-slate-950 transition-all" placeholder="+91 XXXXX XXXXX" />
                       </div>
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Destination Pincode</label>
                       <div className="relative group">
                          <Hash size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                          <input type="text" maxLength={6} value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} className="w-full pl-16 pr-6 py-5 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 outline-none font-bold text-slate-950 transition-all" placeholder="600001" />
                       </div>
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Street Protocol (Address)</label>
                       <div className="relative group">
                          <MapPin size={18} className="absolute left-6 top-8 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                          <textarea rows={3} value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full pl-16 pr-6 py-5 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 outline-none font-bold text-slate-950 transition-all resize-none" placeholder="Flat No, Building, Area Name..." />
                       </div>
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">City / Hub</label>
                       <div className="relative group">
                          <Building2 size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                          <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full pl-16 pr-6 py-5 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 outline-none font-bold text-slate-950 transition-all" placeholder="Chennai, Bangalore, etc." />
                       </div>
                    </div>
                  </div>
                  <div className="mt-12 flex gap-4">
                     <button onClick={() => setStep(1)} className="px-8 py-5 rounded-[1.25rem] bg-slate-100 text-slate-600 font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all">Previous</button>
                     <button onClick={() => validateDetails() && setStep(3)} className="flex-1 py-5 rounded-[1.25rem] bg-slate-950 text-white font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">Proceed to Protocol</button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="glass-card p-10 bg-white">
                  <h2 className="text-3xl font-black text-slate-950 mb-10 uppercase italic tracking-tighter">Payment Protocol</h2>
                  
                  {/* COUPON SECTION */}
                  <div className="mb-10 p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Ticket size={14} className="text-indigo-500" />
                        Voucher Credentials
                     </label>
                     <div className="flex gap-4">
                        <input 
                           type="text" 
                           value={couponInput}
                           onChange={(e) => setCouponInput(e.target.value)}
                           disabled={!!appliedCoupon}
                           placeholder={appliedCoupon ? `NODE ACTIVE: ${appliedCoupon}` : "ENTER COUPON (e.g. NEW10)"}
                           className={`flex-1 px-6 py-4 rounded-xl border font-black text-sm transition-all outline-none ${appliedCoupon ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5'}`}
                        />
                        {appliedCoupon ? (
                           <button onClick={removeCoupon} className="px-6 py-4 bg-rose-50 text-rose-500 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-100 transition-all flex items-center gap-2">
                              <XCircle size={14} /> Remove
                           </button>
                        ) : (
                           <button onClick={handleApplyCoupon} className="px-8 py-4 bg-slate-950 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all">
                              Apply Code
                           </button>
                        )}
                     </div>
                     {appliedCoupon && (
                        <p className="mt-4 text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                           <CheckCircle size={12} /> Protocol Accepted: 10% Yield Reduction Applied
                        </p>
                     )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { id: 'RAZORPAY', name: 'RAZORPAY GATEWAY', icon: <CreditCard size={28} />, desc: 'Cards, Netbanking, & Wallets' },
                      { id: 'UPI', name: 'UPI INTERFACE', icon: <Smartphone size={28} />, desc: 'Instant App-to-App Transfer' },
                      { id: 'COD', name: 'DELIVERY LEDGER', icon: <Banknote size={28} />, desc: 'Cash payment at node drop' }
                    ].map(m => (
                      <button key={m.id} onClick={() => setPaymentMethod(m.id)} className={`p-8 rounded-[2rem] text-left transition-all border-2 flex flex-col items-start gap-6 relative group ${paymentMethod === m.id ? 'border-slate-950 bg-slate-50 ring-4 ring-slate-900/5' : 'border-slate-100 hover:border-slate-300 bg-white'}`}>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${paymentMethod === m.id ? 'bg-slate-950 text-emerald-400 shadow-xl' : 'bg-slate-100 text-slate-400'}`}>{m.icon}</div>
                        <div>
                          <p className="font-black text-slate-950 tracking-tight">{m.name}</p>
                          <p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-1 ${paymentMethod === m.id ? 'text-indigo-600' : 'text-slate-400'}`}>{m.desc}</p>
                        </div>
                        {paymentMethod === m.id && <div className="absolute top-6 right-6 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)] animate-pulse"></div>}
                      </button>
                    ))}
                  </div>
                  {paymentMethod === 'UPI' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-8 p-10 bg-slate-950 rounded-[2.5rem] flex flex-col items-center gap-6 overflow-hidden">
                       <div className="w-32 h-32 bg-white p-3 rounded-3xl shadow-2xl flex items-center justify-center"><QrCode size={100} /></div>
                       <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] text-center">Scan Protocol for UPI Uplink</p>
                    </motion.div>
                  )}
                  <div className="mt-12 flex gap-4">
                     <button onClick={() => setStep(2)} className="px-8 py-5 rounded-[1.25rem] bg-slate-100 text-slate-600 font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all">Previous</button>
                     <button onClick={() => setStep(4)} className="flex-1 py-5 rounded-[1.25rem] bg-slate-950 text-white font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">Execute Final Review</button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-12 bg-white flex flex-col items-center text-center">
                   <div className="w-28 h-28 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-emerald-500 mb-10 shadow-sm border border-emerald-100"><ShieldCheck size={56} /></div>
                   <h2 className="text-4xl font-black text-slate-950 uppercase italic tracking-tighter mb-4">Execute Commit</h2>
                   <p className="text-slate-500 font-bold text-sm max-w-sm mb-12 uppercase tracking-wide leading-relaxed">You are about to authorize a transaction of <span className="text-indigo-600">₹{finalTotal.toLocaleString()}</span> at the Nexis hub.</p>
                   
                   <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                      <div className="p-6 bg-slate-50 rounded-3xl text-left border border-slate-100"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated To</p><p className="font-bold text-slate-950 text-sm">{formData.fullName}</p></div>
                      <div className="p-6 bg-slate-50 rounded-3xl text-left border border-slate-100"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Settlement Via</p><p className="font-bold text-slate-950 text-sm">{paymentMethod}</p></div>
                      <div className="md:col-span-2 p-6 bg-slate-50 rounded-3xl text-left border border-slate-100"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Logistics Drop</p><p className="font-bold text-slate-950 text-sm line-clamp-1">{formData.address}, {formData.city}</p></div>
                   </div>

                   <div className="flex gap-4 w-full">
                      <button onClick={() => setStep(3)} className="px-8 py-5 rounded-[1.25rem] bg-slate-100 text-slate-600 font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all">Back</button>
                      <button onClick={() => paymentMethod === 'RAZORPAY' ? processRazorpay() : handleCheckout()} disabled={submitting} className={`flex-1 py-6 rounded-[2rem] font-black text-white text-lg uppercase tracking-widest transition-all shadow-2xl ${submitting ? 'bg-slate-800 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20 active:scale-95'}`}>
                         {submitting ? 'Processing Uplink...' : 'Confirm & Execute'}
                      </button>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar: Order Summary Cluster */}
          <div className="lg:col-span-5">
            <div className="glass-card bg-slate-950 text-white p-10 sticky top-28 shadow-premium overflow-hidden border border-white/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
                <h3 className="text-2xl font-black mb-10 flex items-center justify-between italic tracking-tight uppercase">
                   Vault Summary
                   <Zap size={20} className="text-indigo-400 fill-indigo-400/20" />
                </h3>
                
                <div className="space-y-6 mb-12 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                   {product ? (
                     <div className="flex gap-6 p-5 bg-white/5 rounded-3xl border border-white/10 group">
                        <div className="h-20 w-20 bg-white/10 rounded-2xl overflow-hidden p-3 border border-white/5"><img src={product.imageUrl} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" /></div>
                        <div className="flex-1 flex flex-col justify-center"><p className="font-bold text-sm line-clamp-1 tracking-tight">{product.name}</p><p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Certified Node</p><p className="text-indigo-400 font-black text-lg mt-1">₹{product.price.toLocaleString()}</p></div>
                     </div>
                   ) : cart.map((item, idx) => (
                     <div key={idx} className="flex gap-6 p-5 bg-white/5 rounded-3xl border border-white/10 group">
                        <div className="h-20 w-20 bg-white/10 rounded-2xl overflow-hidden p-3 border border-white/5"><img src={item.imageUrl} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" /></div>
                        <div className="flex-1 flex flex-col justify-center"><p className="font-bold text-sm line-clamp-1 tracking-tight">{item.name}</p><p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">QTY: {item.quantity}</p><p className="text-indigo-400 font-black text-lg mt-1">₹{(item.price * item.quantity).toLocaleString()}</p></div>
                     </div>
                   ))}
                </div>

                <div className="space-y-6 pt-10 border-t border-white/10 font-bold text-slate-500">
                   <div className="flex justify-between items-center text-xs uppercase tracking-widest"><span>Item Protocol Value</span><span className="text-white text-lg font-black tracking-tight">₹{originalTotal.toLocaleString()}</span></div>
                   {appliedCoupon && (
                     <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex justify-between items-center text-xs uppercase tracking-widest">
                        <span className="text-emerald-400 flex items-center gap-1.5"><Ticket size={12} /> Discount Applied ({appliedCoupon})</span>
                        <span className="text-emerald-400 font-black">- ₹{discountAmount.toLocaleString()}</span>
                     </motion.div>
                   )}
                   <div className="flex justify-between items-center text-xs uppercase tracking-widest"><span>Logistics Ledger</span><span className="text-emerald-400 text-xs font-black italic tracking-widest border-b border-emerald-400/30">Free Priority</span></div>
                   <div className="flex justify-between items-center text-xs uppercase tracking-widest"><span>State Tax Engine</span><span className="text-white font-black">Included</span></div>
                   <div className="pt-10 mt-6 border-t border-white/10 flex justify-between items-end">
                      <div className="flex flex-col"><span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-1">Commit Value</span><span className={`text-5xl font-black italic tracking-tighter transition-all duration-500 ${appliedCoupon ? 'text-emerald-400' : 'text-white'}`}>₹{finalTotal.toLocaleString()}</span></div>
                   </div>
                </div>

                <div className="mt-12 p-6 bg-white/5 rounded-3xl flex items-center gap-6 border border-white/5">
                   <div className="h-12 w-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 shadow-inner"><Lock size={22} /></div>
                   <div className="flex-1 text-left"><p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 italic">AES-256 Protocol</p><p className="text-[9px] text-slate-600 font-bold leading-relaxed uppercase tracking-wide">End-to-End hardware encrypted checkout for authorized personnel only.</p></div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
