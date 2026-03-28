"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CheckoutSuccessPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-[120px] animate-pulse"></div>
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500 rounded-full blur-[120px] animate-pulse transition-delay-1000"></div>
      </div>

      <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-12 rounded-[3.5rem] shadow-2xl relative z-10 max-w-xl w-full transform transition-all duration-1000 scale-110 opacity-100 animate-in fade-in zoom-in-95 duration-700">
        <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-500/50 animate-bounce">
           <svg className="w-12 h-12 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path>
           </svg>
        </div>

        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Order Successful!</h1>
        <p className="text-slate-400 text-lg font-medium mb-12">
          Thank you for choosing Nexis! Your order has been placed successfully and the sellers have been notified.
        </p>

        <div className="bg-white/5 rounded-2xl p-6 mb-12 text-left border border-white/5">
           <div className="flex items-center gap-4 text-emerald-500 mb-2">
              <span className="text-xl">📧</span>
              <span className="font-bold text-sm uppercase tracking-widest">Confirmation Sent</span>
           </div>
           <p className="text-sm text-slate-500 font-medium">
             Check your registered email and SMS for order details and receipt.
           </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Link href="/" className="bg-white text-slate-950 px-8 py-4 rounded-2xl font-black transition hover:bg-slate-100 shadow-xl shadow-white/5">
             Home
          </Link>
          <Link href="/profile" className="bg-emerald-500 text-slate-950 px-8 py-4 rounded-2xl font-black transition hover:bg-emerald-400 shadow-xl shadow-emerald-500/20">
             My Orders
          </Link>
        </div>
      </div>

      <p className="mt-12 text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] relative z-10">Premium Nexis Experience</p>
    </div>
  );
}
