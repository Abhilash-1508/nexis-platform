"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const STRIPE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const isStripeEnabled = STRIPE_KEY && STRIPE_KEY.startsWith('pk_');
const stripePromise = isStripeEnabled ? loadStripe(STRIPE_KEY) : null;
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  sellerId: number;
}

function StripeCheckoutForm({ product, clientSecret, currentUser }: { product: Product, clientSecret: string, currentUser: any }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setErrorMessage("");
    
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: 'http://localhost:3000/' },
    });

    if (error) {
      setErrorMessage(error.message || "An unknown error occurred");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl space-y-6">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <span className="bg-emerald-500 w-8 h-8 rounded-full flex items-center justify-center text-slate-900 text-sm">1</span>
        Secure Payment Details
      </h2>
      <div className="bg-white p-4 rounded-xl shadow-inner"><PaymentElement /></div>
      {errorMessage && <div className="text-red-400 text-sm font-semibold">{errorMessage}</div>}
      <div className="pt-6">
        <button type="submit" disabled={!stripe || processing} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-xl shadow-lg shadow-emerald-500/20 text-center transition flex items-center justify-center gap-2 group disabled:opacity-50">
          {processing ? (
            <div className="flex items-center gap-3">
               <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
               <span>Verifying Transaction...</span>
            </div>
          ) : (
            <><span>Complete Purchase (₹{product.price.toFixed(2)})</span><span className="group-hover:translate-x-1 transition">→</span></>
          )}
        </button>
        <p className="text-center text-slate-500 text-[10px] mt-4 uppercase tracking-tighter">🔒 Secured by Stripe</p>
      </div>
    </form>
  );
}

function MockCheckoutForm({ product, currentUser }: { product: Product, currentUser: any }) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.token}` },
        body: JSON.stringify({ productId: product.id }),
      });
      if (response.ok) {
        alert("Payment successful! An SMS and Email confirmation has been sent via Backend.");
        router.push('/');
      } else {
        const errorData = await response.json().catch(() => null);
        alert(errorData?.message || "Payment failed. Please try again.");
      }
    } catch (error) {
       console.error(error);
       alert("Network error.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Visual Card Representation */}
      <div className="relative h-56 w-full max-w-sm mx-auto bg-gradient-to-br from-emerald-500 to-teal-700 rounded-2xl shadow-2xl p-8 text-white flex flex-col justify-between overflow-hidden group">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition duration-700"></div>
        <div className="flex justify-between items-start relative z-10">
          <div className="w-12 h-10 bg-yellow-400/80 rounded-md shadow-inner"></div>
          <div className="text-2xl font-bold italic tracking-widest opacity-80">VISA</div>
        </div>
        <div className="text-2xl font-medium tracking-[0.2em] relative z-10 drop-shadow-md">
          {cardNumber || "•••• •••• •••• ••••"}
        </div>
        <div className="flex justify-between items-end relative z-10">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider opacity-60">Card Holder</span>
            <span className="font-medium tracking-wide uppercase truncate max-w-[180px]">{cardName || currentUser.name}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider opacity-60">Expires</span>
            <span className="font-medium tracking-wide">{expiry || "MM/YY"}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleCheckout} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="bg-emerald-500 w-8 h-8 rounded-full flex items-center justify-center text-slate-900 text-sm">1</span>
          Secure Payment Details (Mock Mode)
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Name on Card</label>
            <input required type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder={currentUser.name} className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Card Number</label>
            <input required type="text" value={cardNumber} onChange={(e) => {
               const val = e.target.value.replace(/\D/g, '').substring(0, 16);
               setCardNumber(val.replace(/(.{4})/g, '$1 ').trim());
            }} placeholder="0000 0000 0000 0000" className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Expiry Date</label>
               <input required type="text" value={expiry} onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, '').substring(0, 4);
                  if(val.length > 2) val = val.substring(0,2) + "/" + val.substring(2);
                  setExpiry(val);
               }} placeholder="MM/YY" className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition" />
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">CVV</label>
               <input required type="text" value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 3))} placeholder="123" className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition" />
            </div>
          </div>
        </div>

        <div className="pt-6">
          <button type="submit" disabled={processing} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-xl shadow-lg shadow-emerald-500/20 text-center transition flex items-center justify-center gap-2 group disabled:opacity-50">
            {processing ? (
              <div className="flex items-center gap-3">
                 <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                 <span>Verifying Transaction...</span>
              </div>
            ) : (
              <><span>Complete Purchase (₹{product.price.toFixed(2)})</span><span className="group-hover:translate-x-1 transition">→</span></>
            )}
          </button>
          <p className="text-center text-slate-500 text-[10px] mt-4 uppercase tracking-tighter">🔒 256-bit Secure Encryption Guaranteed</p>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{name: string; token: string} | null>(null);
  const [clientSecret, setClientSecret] = useState<string>("");

  useEffect(() => {
    const userStr = localStorage.getItem('nexis_user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    } else {
      router.push('/login');
      return;
    }

    fetch(`${API_URL}/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        if (isStripeEnabled) {
          return fetch(`${API_URL}/api/payments/create-payment-intent`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ amount: Math.round(data.price * 100) })
          });
        }
        return Promise.resolve({ json: () => Promise.resolve({ clientSecret: 'mock' }) } as any);
      })
      .then((res: any) => res.json ? res.json() : res)
      .then((data: any) => {
         setClientSecret(data.clientSecret);
         setLoading(false);
      })
      .catch(err => {
        console.error("Error setting up checkout:", err);
        setLoading(false);
      });
  }, [id, router]);

  if (loading || !currentUser) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-medium">Preparing checkout gateway...</div>;
  if (!product) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xl font-medium">Product not found.</div>;

  return (
    <div className="bg-slate-950 min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4 mb-12">
           <Link href="/" className="text-slate-400 hover:text-white transition">← Back to Store</Link>
           <h1 className="text-4xl font-extrabold text-white tracking-tight">Complete Your Order</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-7 space-y-8">
            {isStripeEnabled && clientSecret && stripePromise && (
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                 <StripeCheckoutForm product={product} clientSecret={clientSecret} currentUser={currentUser} />
              </Elements>
            )}
            {!isStripeEnabled && <MockCheckoutForm product={product} currentUser={currentUser} />}
          </div>

          <div className="lg:col-span-5">
             <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl sticky top-24">
                <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Order Summary</h2>
                <div className="flex items-center gap-6 mb-8 group">
                  <div className="w-24 h-24 bg-slate-900 rounded-xl flex-shrink-0 flex items-center justify-center p-3 relative overflow-hidden">
                    <img src={product.imageUrl || 'https://placehold.co/100x100?text=Item'} alt={product.name} className="max-h-full max-w-full object-contain relative z-10 drop-shadow-lg" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg line-clamp-2 leading-snug">{product.name}</h3>
                    <div className="text-emerald-400 text-sm font-bold mt-1">Free Delivery Included</div>
                  </div>
                </div>
                <div className="space-y-4 text-slate-300">
                  <div className="flex justify-between items-center text-sm">
                    <span className="opacity-60">Subtotal</span>
                    <span className="font-medium text-white">₹{product.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-4 border-t border-white/5">
                    <span className="text-white font-bold text-xl">Grand Total</span>
                    <span className="text-white font-black text-2xl">₹{product.price.toFixed(2)}</span>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
