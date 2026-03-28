"use client";

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Truck, 
  Leaf, 
  Star, 
  Heart, 
  ShoppingCart, 
  Zap, 
  Trash2, 
  ChevronLeft,
  Share2,
  Package,
  Wrench,
  Clock,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  conditionGrade: string;
  category: string;
  warrantyMonths: number;
  accessoriesIncluded: string;
  stockQuantity: number;
  imageUrl: string;
  sellerId: number;
}

function ProductDetailContent() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: number; name: string; token?: string; role?: string } | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [related, setRelated] = useState<Product[]>([]);
  const { addToCart, cart } = useCart();

  const fetchProduct = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`);
      if (!res.ok) throw new Error("Product not found");
      const data = await res.json();
      setProduct(data);
      
      const saved = localStorage.getItem('nexis_wishlist');
      if (saved) {
         const ids = JSON.parse(saved);
         setIsWishlisted(ids.includes(data.id));
      }
      
      fetchRelated(data.category);
    } catch (err) {
      toast.error("Product not found.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelated = async (category: string) => {
    try {
       const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?category=${category}&size=4`);
       if (res.ok) {
          const data = await res.json();
          setRelated(data.content || data);
       }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('nexis_user');
    if(userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Error parsing user", e);
      }
    }
    fetchProduct();
  }, [id]);

  const toggleWishlist = () => {
    if (!product) return;
    const saved = localStorage.getItem('nexis_wishlist');
    let ids = saved ? JSON.parse(saved) : [];
    let updated;
    if (ids.includes(product.id)) {
      updated = ids.filter((item: number) => item !== product.id);
      toast.success("Removed from registry");
      setIsWishlisted(false);
    } else {
      updated = [...ids, product.id];
      toast.success("Saved to registry", { icon: '❤️' });
      setIsWishlisted(true);
    }
    localStorage.setItem('nexis_wishlist', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const handleAddToCart = () => {
    if (product) {
       addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          sellerId: product.sellerId,
          quantity: 1
       });
       toast.success("Product added to cart.", { icon: '🛒' });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="lg:w-[55%] aspect-square bg-slate-200 animate-pulse rounded-[2.5rem]"></div>
          <div className="lg:w-[45%] space-y-8">
            <div className="h-4 w-32 bg-slate-200 animate-pulse rounded-full"></div>
            <div className="h-16 w-full bg-slate-200 animate-pulse rounded-3xl"></div>
            <div className="h-20 w-64 bg-slate-200 animate-pulse rounded-3xl"></div>
            <div className="h-48 w-full bg-slate-200 animate-pulse rounded-3xl"></div>
            <div className="h-20 w-full bg-slate-200 animate-pulse rounded-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6">
       <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-white text-3xl">!</div>
       <h1 className="text-3xl font-black">Product Not Found</h1>
       <Link href="/" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all">Back to Home</Link>
    </div>
  );

  const cartItem = cart.find(item => item.id === product.id);
  const currentCartQty = cartItem ? cartItem.quantity : 0;
  const canAddToCart = currentCartQty < product.stockQuantity;
  const canDelete = currentUser && (currentUser.role === 'SUPER_ADMIN' || currentUser.id === product.sellerId);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        
        <nav className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">
           <Link href="/" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
             <ChevronLeft size={12} /> Storefront
           </Link>
           <span className="opacity-30">/</span>
           <span className="text-slate-900">{product.category}</span>
           <span className="opacity-30">/</span>
           <span className="text-slate-500 truncate max-w-[150px]">{product.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-16">
          
          <div className="lg:w-[55%] space-y-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card bg-white p-12 aspect-square flex items-center justify-center relative group overflow-hidden shadow-premium">
               <div className="absolute top-8 right-8 flex flex-col gap-3 z-10">
                  <button onClick={toggleWishlist} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg ${isWishlisted ? 'bg-rose-500 text-white' : 'bg-white/90 backdrop-blur-md text-slate-400 hover:text-rose-500 hover:scale-110'}`}>
                    <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                  </button>
                   <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }} className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:scale-110 transition-all shadow-lg">
                     <Share2 size={20} />
                   </button>
               </div>
               <img src={product.imageUrl || 'https://placehold.co/800x800?text=Nexis+Asset'} alt={product.name} className="max-h-full max-w-full object-contain transition-transform duration-1000 group-hover:scale-110 drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)]" />
               <div className="absolute bottom-8 left-8 bg-slate-900/10 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black text-slate-900 uppercase tracking-widest border border-white/20">Verified Product</div>
            </motion.div>

            <div className="grid grid-cols-3 gap-4">
               {[{ icon: <ShieldCheck size={20} />, label: "Certified", color: "indigo" }, { icon: <Truck size={20} />, label: "Secured Transit", color: "sky" }, { icon: <Leaf size={20} />, label: "Eco-Benefit", color: "emerald" }].map((item, i) => (
                 <div key={i} className="glass-card p-4 flex flex-col items-center gap-2 group hover:bg-white transition-colors">
                    <div className={`text-${item.color}-500 group-hover:scale-110 transition-transform`}>{item.icon}</div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                 </div>
               ))}
            </div>
          </div>

          <div className="lg:w-[45%] flex flex-col pt-4">
             <div className="mb-6 flex items-center gap-3">
                <span className="bg-slate-900 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em]">Condition: {product.conditionGrade}</span>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-100 italic">
                   <Star size={14} className="fill-amber-400 text-amber-400" />
                   <span className="text-xs font-black text-amber-700">4.9/5 Elite Seller</span>
                </div>
             </div>

             <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-6 leading-tight uppercase italic underline decoration-indigo-500/10 underline-offset-8 decoration-4">{product.name}</h1>

             <div className="flex items-baseline gap-4 mb-10">
                <div className="text-6xl font-black text-slate-900 tracking-tighter">₹{product.price.toLocaleString()}</div>
                <div className="text-slate-400 text-sm font-bold line-through">₹{(product.price * 1.4).toLocaleString()}</div>
                <div className="text-emerald-500 text-xs font-black uppercase tracking-widest">Save 40%</div>
             </div>

             <div className="glass-card p-8 bg-indigo-600/5 border-indigo-500/10 space-y-6 mb-10">
                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-1"><p className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Clock size={12} className="text-indigo-500" /> Warranty</p><p className="text-sm font-bold text-slate-900">{product.warrantyMonths > 0 ? `${product.warrantyMonths} Months` : 'Standard'}</p></div>
                   <div className="space-y-1"><p className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Wrench size={12} className="text-indigo-500" /> Extras</p><p className="text-sm font-bold text-slate-900">{product.accessoriesIncluded || 'None'}</p></div>
                   <div className="space-y-1"><p className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Package size={12} className="text-indigo-500" /> Stock</p><p className={`text-sm font-bold ${product.stockQuantity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{product.stockQuantity > 0 ? `${product.stockQuantity} Available` : 'Out of Stock'}</p></div>
                   <div className="space-y-1"><p className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Leaf size={12} className="text-indigo-500" /> Impact</p><p className="text-sm font-bold text-slate-900">Eco-Friendly</p></div>
                </div>
             </div>

              <div className="mb-12">
                 <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Product Description</h4>
                 <p className="text-slate-600 font-medium leading-[1.8] whitespace-pre-wrap">{product.description}</p>
              </div>

             <div className="mt-auto space-y-4">
                <div className="flex gap-4">
                  <button onClick={handleAddToCart} disabled={!canAddToCart} className={`flex-1 flex items-center justify-center gap-3 font-black py-5 px-8 rounded-2xl transition-all uppercase tracking-widest text-sm shadow-xl ${!canAddToCart ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                    <ShoppingCart size={20} />
                    {!canAddToCart ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                  {canDelete && <button onClick={() => toast.error("Confirm deletion in admin engine.")} className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all border border-rose-100"><Trash2 size={24} /></button>}
                </div>
                <Link href={`/checkout?productId=${product.id}`} className="flex items-center justify-center gap-3 w-full btn-premium group"><Zap size={20} />Buy Now <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></Link>
             </div>
          </div>
        </div>

        <section className="mt-32">
           <div className="flex justify-between items-end mb-10">
              <div><h3 className="text-2xl font-bold text-slate-900">You May Also Like</h3><p className="text-slate-500 text-sm mt-1">Similar products in {product.category || 'this category'}</p></div>
              <Link href="/" className="text-indigo-600 font-semibold text-sm hover:underline flex items-center gap-1">View All <ArrowRight size={14} /></Link>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {related.filter(r => r.id !== product.id).slice(0, 4).map(item => (
                 <Link href={`/product/${item.id}`} key={item.id} className="glass-card p-4 bg-white hover:shadow-lg transition-shadow group">
                    <div className="h-32 bg-slate-50 rounded-xl mb-3 flex items-center justify-center p-4"><img src={item.imageUrl} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform" /></div>
                    <p className="text-[10px] font-bold text-indigo-600 uppercase mb-1">{item.category}</p>
                    <p className="text-sm font-bold text-slate-900 line-clamp-1">{item.name}</p>
                    <p className="text-sm font-black text-slate-900 mt-2">₹{item.price.toLocaleString()}</p>
                 </Link>
               ))}
            </div>
        </section>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 pt-32"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="h-96 w-full bg-slate-200 animate-pulse rounded-[2.5rem]"></div></div></div>}>
      <ProductDetailContent />
    </Suspense>
  );
}
