"use client";

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Trash2, 
  ShoppingCart, 
  ArrowRight, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Package
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  conditionGrade: string;
  category: string;
}

function WishlistContent() {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const fetchWishlistItems = async () => {
    const savedIdsStr = localStorage.getItem('nexis_wishlist');
    if (!savedIdsStr) {
      setWishlist([]);
      setLoading(false);
      return;
    }

    try {
      const ids: number[] = JSON.parse(savedIdsStr);
      if (ids.length === 0) {
        setWishlist([]);
        setLoading(false);
        return;
      }

      // Fetch all products and filter for wishlist (Ideally backend should have a bulk fetch by IDs)
      const res = await fetch(`${API_URL}/api/products?size=1000`);
      if (res.ok) {
        const allProducts = await res.json();
        const content = allProducts.content || allProducts;
        const filtered = content.filter((p: Product) => ids.includes(p.id));
        setWishlist(filtered);
      }
    } catch (err) {
      console.error("Wishlist sync error:", err);
      toast.error("Failed to sync personal registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistItems();
  }, []);

  const removeFromWishlist = (id: number) => {
    const saved = localStorage.getItem('nexis_wishlist');
    if (saved) {
      const ids: number[] = JSON.parse(saved).filter((item: number) => item !== id);
      localStorage.setItem('nexis_wishlist', JSON.stringify(ids));
      setWishlist(wishlist.filter(p => p.id !== id));
      window.dispatchEvent(new Event('storage'));
      toast.success("Identity purged from wishlist.");
    }
  };

  const handleAddToCart = (product: Product) => {
      addToCart(product);
      toast.success("Added to shopping hub");
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-24 px-4 sm:px-6 lg:px-8 font-sans mt-16">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Protocol */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 px-4">
           <div>
              <nav className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                <Link href="/" className="hover:text-indigo-600">Nexis Hub</Link>
                <ChevronRight size={10} />
                <span className="text-slate-950">Wishlist Registry</span>
              </nav>
              <h1 className="text-5xl font-black text-slate-950 tracking-tighter uppercase italic leading-none">
                 Saved Hardware
              </h1>
              <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                 Personnel Registry • <span className="text-indigo-600 italic">Authorized Access Only</span>
              </p>
           </div>
           
           <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
               <div className="h-12 w-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 shadow-inner">
                  <Heart size={24} fill="currentColor" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Assets</p>
                  <p className="text-2xl font-black text-slate-900 tracking-tighter">{wishlist.length} Items</p>
               </div>
           </div>
        </div>

        {wishlist.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-32 glass-card bg-white flex flex-col items-center">
             <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300 mb-8 border border-slate-50"><Heart size={48} /></div>
             <h2 className="text-3xl font-black text-slate-950 uppercase italic mb-4">Registry is Empty</h2>
             <p className="text-slate-500 font-bold text-sm max-w-sm mb-12">No hardware nodes found in your secondary registry. Initialize your search protocol to populate assets.</p>
             <Link href="/" className="px-12 py-5 bg-slate-950 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">Browse Marketplace</Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            <AnimatePresence>
              {wishlist.map((product) => (
                <motion.div 
                   key={product.id} 
                   layout 
                   initial={{ opacity: 0, y: 20 }} 
                   animate={{ opacity: 1, y: 0 }} 
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="glass-card group flex flex-col h-full bg-white hover:shadow-premium hover:-translate-y-2 transition-all duration-500 border-slate-100"
                >
                  <div className="absolute top-6 left-6 z-20 bg-slate-950 text-white text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-lg italic">
                     {product.conditionGrade || 'Standard'}
                  </div>
                  
                  <div className="h-56 w-full bg-slate-50 p-10 flex items-center justify-center relative overflow-hidden">
                    <img src={product.imageUrl} className="max-h-full max-w-full object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-700" alt={product.name} />
                  </div>
                  
                  <div className="p-8 flex-1 flex flex-col">
                     <div className="flex items-center gap-2 mb-4">
                        <span className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">{product.category}</span>
                        <div className="h-1 w-1 rounded-full bg-slate-200"></div>
                        <div className="flex items-center gap-1"><Zap size={10} className="text-amber-500 fill-current" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified</span></div>
                     </div>
                     
                     <h3 className="text-xl font-bold text-slate-950 leading-tight mb-6 line-clamp-2 min-h-[56px] group-hover:text-indigo-600 transition-colors">{product.name}</h3>
                     
                     <div className="mt-auto pt-6 border-t border-slate-50 flex items-end justify-between">
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Commit Value</p>
                           <p className="text-2xl font-black text-slate-950 tracking-tighter">₹{product.price.toLocaleString()}</p>
                        </div>
                        
                        <div className="flex gap-2">
                           <button 
                             onClick={() => removeFromWishlist(product.id)}
                             className="h-12 w-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-all active:scale-90"
                           >
                              <Trash2 size={20} />
                           </button>
                           
                           <button 
                             onClick={() => handleAddToCart(product)}
                             className="px-6 py-3 bg-slate-950 text-white rounded-2xl font-black uppercase tracking-[0.1em] text-[10px] flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                           >
                              <ShoppingCart size={16} /> Deploy to Hub
                           </button>
                        </div>
                     </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        
        {/* Support Strip */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { title: "Safe Settlement", desc: "Every saved asset maintains its real-time market protocol score.", icon: <ShieldCheck /> },
             { title: "Node Alerts", desc: "Notification protocol triggered if any saved asset is scheduled for liquidation.", icon: <Zap /> },
             { title: "Legacy History", desc: "Past iterations and condition logs available for all saved hardware nodes.", icon: <Package /> }
           ].map((item, i) => (
             <div key={i} className="flex items-start gap-4 p-6 rounded-3xl border border-slate-100 bg-white shadow-sm group">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">{item.icon}</div>
                <div><p className="text-[10px] font-black uppercase tracking-widest mb-1">{item.title}</p><p className="text-xs text-slate-500 font-bold leading-tight">{item.desc}</p></div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}

export default function WishlistPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-black text-xs uppercase tracking-widest italic">Syncing Personal Registry...</p>
       </div>
    }>
       <WishlistContent />
    </Suspense>
  );
}
