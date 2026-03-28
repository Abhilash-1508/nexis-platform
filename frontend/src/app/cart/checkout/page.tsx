"use client";

import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useRouter } from 'next/navigation';

export default function CartCheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ id: number; name: string; token?: string } | null>(null);

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi"); // upi, card, netbanking, wallet
  
  // Coupon States
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, pct: number} | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('nexis_user');
    if(userStr) {
      try {
        const u = JSON.parse(userStr);
        setCurrentUser(u);

        // Pre-fill from profile
        if (u) {
          setAddress(u.address || "");
          setPhone(u.mobilePhone || u.phoneNumber || "");
        }
      } catch (e) {
        console.error("Error parsing user", e);
      }
    } else {
      router.push('/login');
    }
    
    if (cart.length === 0) {
      router.push('/cart');
    } else {
      // Opportunistically lock products (backend handles if not applicable)
      cart.forEach(item => {
         fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/products/${item.id}/lock`, { method: 'POST' })
            .catch(e => console.error("Failed to lock product", e));
      });
      // Developer hint: Seed the coupons in the DB automatically
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/coupons/seed`, { method: 'POST' }).catch(() => {});
    }
  }, [cart, router]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !phone) {
       alert("Please fill your shipping address and phone number.");
       return;
    }
    if (paymentMethod === 'card' && (!cardNumber || !expiry || !cvc)) {
       alert("Please fill in all card details.");
       return;
    }

    setLoading(true);

    try {
      // Create [5,5,5] if product ID 5 has quantity 3
      const productIds = cart.flatMap(item => Array(item.quantity).fill(item.id));
      
      const payload = {
         productIds,
         address: address,
         phone: phone,
         paymentMethod: paymentMethod.toUpperCase(),
         couponCode: appliedCoupon ? appliedCoupon.code : null
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/orders/checkout-cart`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser?.token}`
         },
         body: JSON.stringify(payload)
      });

      if (res.ok) {
         clearCart();
         alert("Order placed successfully! Check your email for details.");
         router.push('/');
      } else {
         const errorData = await res.json().catch(() => null);
         alert(errorData?.message || "Checkout failed. Some items may be out of stock.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
      setCouponError(''); setCouponSuccess('');
      if (!couponInput.trim()) return;
      try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/coupons/validate?code=${couponInput.trim().toUpperCase()}`);
          if (res.ok) {
              const data = await res.json();
              setAppliedCoupon({ code: data.code, pct: data.discountPercentage });
              setCouponSuccess(`Promocode Applied! ${data.discountPercentage}% OFF`);
          } else {
              const err = await res.json().catch(() => null);
              setCouponError(err?.error || "Invalid coupon code");
              setAppliedCoupon(null);
          }
      } catch (e) {
          setCouponError("Failed to verify coupon");
      }
  };

  const finalTotal = appliedCoupon ? cartTotal * (1 - appliedCoupon.pct / 100) : cartTotal;
  const discountAmount = cartTotal - finalTotal;

  return (
    <div className="min-h-screen bg-[#0f172a] py-12 px-4 sm:px-6 lg:px-8 mt-16 font-sans text-slate-100">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
        
        {/* Checkout Form */}
        <div className="lg:w-2/3">
          <form onSubmit={handleCheckout} className="space-y-8">
            
            {/* Delivery Details */}
            <div className="bg-[#1e293b] rounded-[2rem] p-8 shadow-xl border border-slate-800">
              <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-4">
                 <span className="bg-indigo-500/20 text-indigo-400 w-10 h-10 rounded-xl flex items-center justify-center text-lg border border-indigo-500/30">1</span>
                 Shipment Profile
              </h2>
              <div className="space-y-6">
                 <div>
                   <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Global Shipping Address</label>
                   <textarea
                     required
                     value={address}
                     onChange={e => setAddress(e.target.value)}
                     className="w-full px-5 py-4 rounded-2xl bg-[#0f172a] border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-white placeholder-slate-600 shadow-inner resize-none"
                     placeholder="Street, Building, City, State, ZIP..."
                     rows={3}
                   ></textarea>
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Secure Contact Channel</label>
                   <input
                     type="tel"
                     required
                     value={phone}
                     onChange={e => setPhone(e.target.value)}
                     className="w-full px-5 py-4 rounded-2xl bg-[#0f172a] border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-white placeholder-slate-600 shadow-inner"
                     placeholder="+91 98765 43210"
                   />
                 </div>
              </div>
            </div>

            {/* Payment Options (Accordion) */}
            <div className="bg-[#1e293b] rounded-[2rem] p-8 shadow-xl border border-slate-800">
              <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-4">
                 <span className="bg-violet-500/20 text-violet-400 w-10 h-10 rounded-xl flex items-center justify-center text-lg border border-violet-500/30">2</span>
                 Payment Authorization
              </h2>
              
              <div className="space-y-5">
                 {/* UPI */}
                 <div className={`border-2 rounded-2xl overflow-hidden transition-all duration-300 ${paymentMethod === 'upi' ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'border-slate-800 bg-[#0f172a] hover:border-slate-700'}`}>
                    <label className="flex items-center p-6 cursor-pointer">
                       <input type="radio" name="payment" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="w-5 h-5 text-indigo-500" />
                       <div className="ml-5">
                          <span className="block font-black text-xl text-white tracking-tight">Instant UPI Transact</span>
                          <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">GPay • PhonePe • Paytm</span>
                       </div>
                       <span className="ml-auto bg-indigo-500/20 text-indigo-400 text-[10px] font-black px-2 py-1 rounded border border-indigo-500/30 tracking-tight">PRIORITY</span>
                    </label>
                    {paymentMethod === 'upi' && (
                       <div className="p-8 border-t border-slate-800 bg-[#161e2e] flex flex-col md:flex-row items-center gap-10">
                          <div className="w-48 h-48 bg-white border-[6px] border-[#0f172a] p-3 rounded-2xl flex items-center justify-center relative shadow-2xl">
                             <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="Mock QR" className="w-full h-full opacity-90 object-cover" />
                             <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[1px] bg-[#0f172a]/20">
                                <span className="bg-white text-slate-900 font-black px-3 py-1 rounded shadow-xl text-[10px] tracking-tight border-2 border-slate-900">MOCK QR</span>
                             </div>
                          </div>
                          <div>
                             <h4 className="font-black text-white text-2xl mb-3">Scan & Authorize</h4>
                             <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-xs">Use any enabled UPI application on your mobile device to authorize the transaction of <span className="text-indigo-400 font-bold">₹{finalTotal.toFixed(2)}</span> instantly.</p>
                             <div className="mt-6 flex flex-wrap gap-2">
                                <span className="bg-[#0f172a] px-3 py-1.5 rounded-lg font-bold text-[10px] text-slate-300 border border-slate-800">Google Pay</span>
                                <span className="bg-[#0f172a] px-3 py-1.5 rounded-lg font-bold text-[10px] text-slate-300 border border-slate-800">PhonePe</span>
                                <span className="bg-[#0f172a] px-3 py-1.5 rounded-lg font-bold text-[10px] text-slate-300 border border-slate-800">Paytm</span>
                             </div>
                          </div>
                       </div>
                    )}
                 </div>

                 {/* Card */}
                 <div className={`border-2 rounded-2xl overflow-hidden transition-all duration-300 ${paymentMethod === 'card' ? 'border-violet-500 bg-violet-500/10 shadow-[0_0_20px_rgba(139,92,246,0.1)]' : 'border-slate-800 bg-[#0f172a] hover:border-slate-700'}`}>
                    <label className="flex items-center p-6 cursor-pointer">
                       <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="w-5 h-5 text-violet-500" />
                       <div className="ml-5">
                          <span className="block font-black text-xl text-white tracking-tight">Credit / Debit Vault</span>
                          <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Visa • Mastercard • Amex</span>
                       </div>
                    </label>
                    {paymentMethod === 'card' && (
                       <div className="p-8 border-t border-slate-800 bg-[#161e2e] space-y-5">
                          <input type="text" placeholder="Card ID Number (Simulation)" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="w-full px-5 py-4 bg-[#0f172a] border border-slate-700 rounded-xl text-white font-medium" required />
                          <div className="flex gap-5">
                             <input type="text" placeholder="Expiry (MM/YY)" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="w-1/2 px-5 py-4 bg-[#0f172a] border border-slate-700 rounded-xl text-white font-medium" required />
                             <input type="password" placeholder="Secure CVC" value={cvc} onChange={(e) => setCvc(e.target.value)} className="w-1/2 px-5 py-4 bg-[#0f172a] border border-slate-700 rounded-xl text-white font-medium" required />
                          </div>
                       </div>
                    )}
                 </div>

                 {/* Wallets */}
                 <div className={`border-2 rounded-2xl overflow-hidden transition-all duration-300 ${paymentMethod === 'wallet' ? 'border-pink-500 bg-pink-500/10 shadow-[0_0_20px_rgba(236,72,153,0.1)]' : 'border-slate-800 bg-[#0f172a] hover:border-slate-700'}`}>
                    <label className="flex items-center p-6 cursor-pointer">
                       <input type="radio" name="payment" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} className="w-5 h-5 text-pink-500" />
                       <div className="ml-5">
                          <span className="block font-black text-xl text-white tracking-tight">Digital Assets / Wallets</span>
                          <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Amazon Pay • MobiKwik</span>
                       </div>
                    </label>
                    {paymentMethod === 'wallet' && (
                       <div className="p-8 border-t border-slate-800 bg-[#161e2e]">
                          <p className="text-sm text-slate-400 font-medium mb-5">Select your primary digital wallet to proceed:</p>
                          <select className="w-full px-5 py-4 bg-[#0f172a] border border-slate-700 rounded-xl bg-white font-bold text-white focus:ring-2 focus:ring-pink-500">
                             <option>Nexis Pay (Primary)</option>
                             <option>Amazon Pay</option>
                             <option>MobiKwik</option>
                             <option>Apple Pay</option>
                          </select>
                       </div>
                    )}
                 </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-2xl py-7 rounded-[2rem] transition-all shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)] disabled:bg-slate-700 disabled:cursor-not-allowed group relative overflow-hidden active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-white/10 w-0 group-hover:w-full transition-all duration-500 ease-out z-0"></div>
              <span className="relative z-10 tracking-widest uppercase">{loading ? 'AUTHORIZING...' : `TRANSACT ₹${finalTotal.toFixed(2)}`}</span>
            </button>
            <p className="text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">🔒 TLS 1.3 Certified • Nexis Security Protocol</p>

          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:w-1/3">
          <div className="bg-[#1e293b] rounded-[2rem] p-8 shadow-xl border border-slate-800 sticky top-24">
             <h3 className="text-2xl font-black text-white mb-8 tracking-tight">Price Manifest <span className="text-slate-500 font-medium block text-xs tracking-widest uppercase mt-1">({cart.length} Integrated Items)</span></h3>
             <div className="space-y-5 text-sm font-bold text-slate-400">
                {cart.map(item => (
                   <div key={item.id} className="flex justify-between items-center group">
                     <span className="line-clamp-1 flex-1 pr-6 group-hover:text-white transition-colors">item://{item.name}</span>
                     <span className="font-black text-white text-base">₹{item.price.toFixed(2)}</span>
                   </div>
                ))}
             </div>
             
             <div className="border-t border-slate-800 mt-8 pt-8 space-y-5 font-bold text-slate-400">
                <div className="flex justify-between items-center">
                   <span className="uppercase text-[10px] tracking-widest text-slate-500">Handling Priority</span>
                   <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-black border border-emerald-500/20">ELITE</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="uppercase text-[10px] tracking-widest text-slate-500">Transit Protocol</span>
                   <span className="text-emerald-400 font-black tracking-tight text-xs">FREE EXPEDITED</span>
                </div>
             </div>

             {/* PROMO CODE SECTION */}
             <div className="border-t border-slate-800 mt-8 pt-8">
                 <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Voucher Authority</label>
                 <div className="flex gap-2">
                     <input 
                         type="text" 
                         value={couponInput}
                         onChange={e => setCouponInput(e.target.value)}
                         placeholder="E.G. NEXIS50"
                         className="flex-1 bg-[#0f172a] border border-slate-700 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-black uppercase text-white placeholder-slate-600 text-sm"
                     />
                     <button type="button" onClick={handleApplyCoupon} className="bg-slate-700 text-white px-5 py-3 rounded-xl font-black text-xs hover:bg-slate-600 transition-colors uppercase tracking-widest">
                         Apply
                     </button>
                 </div>
                 {couponError && <p className="text-pink-500 text-[10px] font-black mt-2 tracking-widest">{couponError}</p>}
                 {couponSuccess && <p className="text-emerald-400 text-[10px] font-black mt-2 tracking-widest">{couponSuccess}</p>}
             </div>
             
             {appliedCoupon && (
                 <div className="bg-indigo-500/10 border border-indigo-500/20 mt-6 p-5 rounded-2xl flex justify-between items-center text-indigo-400 font-black">
                     <span className="uppercase text-xs tracking-widest">Benefit ({appliedCoupon.pct}%)</span>
                     <span className="text-xl">-₹{discountAmount.toFixed(2)}</span>
                 </div>
             )}

             <div className="border-t-2 border-dashed border-slate-800 mt-8 pt-8 flex justify-between items-end">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1">Final Settlement</span>
                    <span className="text-lg font-black text-white leading-none">Total Amount</span>
                 </div>
                 <span className="text-4xl font-black text-indigo-400 tracking-tighter">₹{finalTotal.toFixed(2)}</span>
             </div>
             <div className="mt-8 bg-indigo-500/5 text-indigo-400 text-[10px] font-black px-4 py-4 rounded-2xl text-center border border-indigo-500/10 leading-relaxed uppercase tracking-widest">
                Optimized order: Savings of ₹{(cartTotal - finalTotal).toFixed(2)} detected and applied.
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
