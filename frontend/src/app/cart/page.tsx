"use client";
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart as CartIcon, ShieldCheck, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const router = useRouter();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center text-indigo-400 mb-8 mx-auto border border-white/10 shadow-2xl">
            <CartIcon size={48} />
          </div>
          <h1 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase italic">Inventory Empty</h1>
          <p className="text-slate-500 mb-10 max-w-sm mx-auto font-medium">Your node currently contains 0 assets. Proceed to marketplace to identify new inventory.</p>
          <Link href="/" className="btn-premium px-12 py-4">
            Identify Assets
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] py-24 pb-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
             <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Active Order Protocol</span>
             </div>
             <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter italic uppercase">Marketplace Cart</h1>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-bold">
            <span className="text-white text-2xl font-black">{cartCount}</span>
            <span className="uppercase text-[10px] tracking-widest">Identified Nodes</span>
          </div>
        </header>
        
        <div className="flex flex-col xl:flex-row gap-12 items-start">
          {/* Cart Items */}
          <div className="flex-1 w-full space-y-4">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div 
                  layout
                  key={item.id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-8 hover:bg-white/[0.08] transition-all duration-300"
                >
                  <div className="w-40 h-40 bg-slate-900 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-white/5 p-6 group-hover:bg-slate-800 transition-colors">
                     <img src={item.imageUrl || 'https://placehold.co/400x400?text=Nexis+Asset'} alt={item.name} className="object-contain w-full h-full drop-shadow-2xl transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  
                  <div className="flex-grow space-y-4 text-center md:text-left">
                    <div>
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 block">Certified Hardware</span>
                      <Link href={`/product/${item.id}`} className="text-xl md:text-2xl font-bold text-white hover:text-indigo-400 transition leading-tight line-clamp-1">
                         {item.name}
                      </Link>
                    </div>

                    <div className="flex items-center justify-center md:justify-start gap-6">
                      <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1.5">
                         <button 
                           onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                           className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition disabled:opacity-30" 
                           disabled={item.quantity <= 1}
                         >
                            <Minus size={16} />
                         </button>
                         <span className="font-black text-white w-10 text-center text-lg">{item.quantity}</span>
                         <button 
                           onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                           className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition"
                         >
                            <Plus size={16} />
                         </button>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Unit Price</span>
                        <span className="text-slate-300 font-bold">₹{item.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 pr-4">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Yield</span>
                    <div className="text-3xl font-black text-white tracking-tighter">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="absolute -top-3 -right-3 md:top-6 md:right-6 md:static w-12 h-12 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-2xl transition-all border border-rose-500/20 flex items-center justify-center shadow-lg"
                    title="Remove Node"
                  >
                    <Trash2 size={20} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="w-full xl:w-[400px] flex-shrink-0">
            <div className="bg-white/5 backdrop-blur-2xl border border-white/15 rounded-[2.5rem] p-10 sticky top-28 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)]">
               <h2 className="text-2xl font-black text-white mb-8 italic uppercase italic tracking-tight">Order Analysis</h2>
               
               <div className="space-y-6 text-slate-400 font-bold text-sm mb-10 pb-10 border-b border-white/10">
                 <div className="flex justify-between items-center">
                    <span className="uppercase tracking-widest text-[10px]">Sub-Protocol Value</span>
                    <span className="text-white text-lg font-black tracking-tight">₹{cartTotal.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center text-emerald-400">
                    <span className="uppercase tracking-widest text-[10px]">Logistics Ledger</span>
                    <span className="flex items-center gap-2">
                       <Truck size={14} />
                       Free
                    </span>
                 </div>
                 <div className="flex justify-between items-center text-indigo-400">
                    <span className="uppercase tracking-widest text-[10px]">Vault Protection</span>
                    <span className="flex items-center gap-2 font-black">
                       <ShieldCheck size={14} />
                       Secured
                    </span>
                 </div>
               </div>
               
               <div className="flex justify-between items-center mb-10">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Exchange</span>
                    <span className="text-4xl font-black text-white tracking-tighter italic">₹{cartTotal.toLocaleString()}</span>
                  </div>
               </div>
               
               <button
                 onClick={() => router.push('/checkout')}
                 className="w-full btn-premium py-6 flex items-center justify-center gap-3 text-lg"
               >
                 Execute Checkout <ArrowRight size={20} />
               </button>
               
               <p className="text-center text-[9px] text-slate-500 mt-6 font-bold uppercase tracking-widest italic animate-pulse">
                  Nexis Protocol Verified Shipment Ready
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
