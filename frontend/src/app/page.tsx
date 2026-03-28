"use client";

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Leaf, 
  ShieldCheck, 
  Truck, 
  Star, 
  Heart, 
  ArrowRight, 
  ChevronRight,
  Monitor,
  Laptop,
  Smartphone,
  Cpu,
  Tv,
  Coffee,
  ShoppingBag,
  Filter,
  Trash2,
  Edit,
  MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  conditionGrade: string;
  category: string;
  imageUrl: string;
  stockQuantity: number;
}

const CATEGORIES = [
  { name: "All", icon: <ShoppingBag size={18} /> },
  { name: "Mobiles & Electronics", icon: <Smartphone size={18} /> },
  { name: "Laptops & Accessories", icon: <Laptop size={18} /> },
  { name: "Home Appliances", icon: <Coffee size={18} /> },
  { name: "Furniture", icon: <Monitor size={18} /> },
  { name: "Fashion & Wearables", icon: <ShoppingBag size={18} /> },
  { name: "Sports Equipment", icon: <Cpu size={18} /> },
  { name: "Others", icon: <Tv size={18} /> }
];

const CONDITIONS = ["All", "Like New", "Excellent", "Good", "Fair"];

function SkeletonCard() {
  return (
    <div className="glass-card p-6 h-[420px] animate-pulse">
      <div className="h-48 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl mb-6"></div>
      <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
      <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded mb-8"></div>
      <div className="flex justify-between items-end">
        <div className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="h-12 w-12 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
      </div>
    </div>
  );
}

function ProductBrowser() {
  const searchParams = useSearchParams();
  const queryKeyword = searchParams.get('q') || "";
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCondition, setSelectedCondition] = useState("All");
  const [currentUser, setCurrentUser] = useState<{ id: number; name: string; token?: string; role?: string } | null>(null);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [wishlist, setWishlist] = useState<number[]>([]);

  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('nexis_user');
    if(userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Error parsing user", e);
      }
    }
  }, []);

  useEffect(() => {
    if (queryKeyword) {
      setKeyword(queryKeyword);
    }
  }, [queryKeyword]);

  const fetchProducts = (searchKw: string = keyword) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchKw) params.append("keyword", searchKw);
    if (selectedCategory && selectedCategory !== "All") params.append("category", selectedCategory);
    if (selectedCondition && selectedCondition !== "All") params.append("condition", selectedCondition);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?${params.toString()}&size=50`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setProducts(data.content || data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        setLoading(false);
        toast.error("Failed to sync with global marketplace.");
      });
  };

  useEffect(() => {
    fetchProducts(queryKeyword || keyword);
  }, [selectedCategory, selectedCondition, queryKeyword]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
    toast.success(`Found inventory for "${keyword}"`);
  };

  useEffect(() => {
    const saved = localStorage.getItem('nexis_wishlist');
    if (saved) setWishlist(JSON.parse(saved));
  }, []);

  const toggleWishlist = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    let updated;
    if (wishlist.includes(id)) {
      updated = wishlist.filter(item => item !== id);
      toast.success("Removed from wishlist");
    } else {
      updated = [...wishlist, id];
      toast.success("Added to wishlist", { icon: '❤️' });
    }
    setWishlist(updated);
    localStorage.setItem('nexis_wishlist', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const user = JSON.parse(localStorage.getItem('nexis_user') || '{}');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        toast.success('Product deleted');
        fetchProducts();
      } else {
        toast.error('Failed to delete product');
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Error deleting product');
    }
    setActiveMenu(null);
  };

  return (
    <div className="pb-20">
      
      {/* HERO SECTION - REINVENTED */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-24 bg-slate-950">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px] animate-pulse delay-700"></div>
          {/* Animated Matrix-like particles or grid */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full mb-8 shadow-2xl">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-slate-300 text-[10px] font-black uppercase tracking-[0.3em]">Protocol Neutral Marketplace</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9] drop-shadow-2xl">
              Next-Gen Tech.<br />
              <span className="premium-gradient-text animate-pulse">Zero Compromise.</span>
            </h1>

            <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
              Join the circular revolution. Access professional-grade refurbished electronics that slash industrial e-waste by 
              <span className="text-white font-black"> 92%</span>. Expertly verified, protocol-secured.
            </p>

            <div className="max-w-2xl mx-auto mb-16">
              <form onSubmit={handleSearch} className="relative group p-2 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] group">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                    <input 
                      type="text" 
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="Identify assets (MacBooks, GPUs, Consoles...)" 
                      className="w-full bg-transparent border-none pl-14 pr-4 py-5 text-white font-bold placeholder:text-slate-600 focus:ring-0 text-lg"
                    />
                  </div>
                  <button type="submit" className="btn-premium px-10 group/btn">
                    <span className="relative z-10 flex items-center gap-2">
                      Search <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </div>
              </form>
            </div>

            <div className="flex flex-wrap justify-center gap-12">
              <div className="flex flex-col items-center gap-2 group">
                <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-all">
                  <Leaf size={28} />
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CO2 Neutral</span>
              </div>
              <div className="flex flex-col items-center gap-2 group">
                <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-all">
                  <ShieldCheck size={28} />
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Verified Vault</span>
              </div>
              <div className="flex flex-col items-center gap-2 group">
                <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-sky-400 group-hover:bg-sky-500/20 transition-all">
                  <Truck size={28} />
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hyper-Logistics</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="hidden lg:block absolute top-1/4 left-10 h-32 w-32 glass-card animate-float opacity-20"></div>
        <div className="hidden lg:block absolute bottom-1/4 right-10 h-48 w-48 glass-card animate-float opacity-10 [animation-delay:1s]"></div>
      </section>

      {/* STATS STRIP */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-30">
        <div className="glass-card grid grid-cols-2 md:grid-cols-4 p-8 md:p-12 gap-8 text-center bg-white/10 shadow-premium">
          <div>
            <div className="text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tighter">1.2M</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Carbon Neutralized (KG)</div>
          </div>
          <div className="border-l border-slate-200/50">
            <div className="text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tighter">45K+</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Nodes (Users)</div>
          </div>
          <div className="border-l border-slate-200/50">
            <div className="text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tighter">₹8.5Cr</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Value Exchanged</div>
          </div>
          <div className="border-l border-slate-200/50">
            <div className="text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tighter">99.9%</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Uptime</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 flex flex-col lg:flex-row gap-12">
        
        {/* SIDEBAR FILTERS - GLASS DESIGN */}
        <aside className="w-full lg:w-80 flex-shrink-0 space-y-8">
          <div className="glass-card p-10 sticky top-28 bg-white/40">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] mb-8 flex items-center justify-between">
              Categories <Filter size={14} className="text-indigo-500" />
            </h3>
            
            <div className="space-y-2 mb-12">
              {CATEGORIES.map(cat => (
                <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`group w-full flex items-center justify-between px-5 py-3 rounded-2xl text-sm transition-all duration-300 font-bold ${selectedCategory === cat.name ? 'bg-slate-900 text-white shadow-xl translate-x-1' : 'text-slate-500 hover:bg-slate-100 hover:translate-x-1'}`}
              >
                <div className="flex items-center gap-3">
                  <span className={selectedCategory === cat.name ? 'text-indigo-400' : 'text-slate-400'}>{cat.icon}</span>
                  {cat.name}
                </div>
                {selectedCategory === cat.name && <div className="h-1.5 w-1.5 rounded-full bg-indigo-400"></div>}
              </button>
              ))}
            </div>

            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] mb-8 flex items-center justify-between">
              Condition <ShieldCheck size={14} className="text-emerald-500" />
            </h3>
            <div className="space-y-2">
              {CONDITIONS.map(cond => (
                <button
                  key={cond}
                  onClick={() => setSelectedCondition(cond)}
                  className={`w-full flex items-center justify-between px-5 py-3 rounded-2xl text-sm transition-all duration-300 font-bold ${selectedCondition === cond ? 'bg-slate-900 text-white shadow-xl translate-x-1' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  {cond}
                  {selectedCondition === cond && <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN GRID */}
        <main className="flex-1 min-w-0">
          <div className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
            <div>
              <nav className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                <Link href="/" className="hover:text-indigo-600">Nexis</Link>
                <ChevronRight size={10} />
                <span className="text-slate-900">{selectedCategory}</span>
              </nav>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight leading-none">
                {selectedCategory === "All" ? "All Products" : selectedCategory}
              </h2>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-10 w-10 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500 shadow-sm overflow-hidden">
                       <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                    </div>
                  ))}
                  <div className="h-10 w-10 rounded-full border-4 border-white bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white shadow-sm">+99</div>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Buyers</p>
                  <p className="text-sm font-bold text-slate-900">{products.length} product(s) found</p>
               </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8"
              >
                {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
              </motion.div>
            ) : products.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-24 glass-card bg-white/50 flex flex-col items-center"
              >
                <div className="text-6xl mb-6">🔍</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">No products found</h3>
                <p className="text-slate-500 max-w-sm mb-8">Try adjusting your filters or search keywords to find what you&apos;re looking for.</p>
                <button 
                  onClick={() => { setKeyword(""); setSelectedCategory("All"); setSelectedCondition("All"); }} 
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                >
                  Clear Filters
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8"
              >
                {products.map((product) => (
                  <Link 
                    href={`/product/${product.id}`} 
                    key={product.id} 
                    className="glass-card group relative h-[480px] flex flex-col overflow-hidden bg-white hover:shadow-premium hover:-translate-y-2 transition-all duration-500"
                  >
                    {/* Condition badge - top left */}
                    {product.conditionGrade && (
                      <div className="absolute top-4 left-4 z-20 bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-lg">
                        {product.conditionGrade}
                      </div>
                    )}

                    {/* Image Section - Fixed Height */}
                    <div className="relative h-56 w-full bg-slate-50 flex items-center justify-center p-10 overflow-hidden group-hover:bg-slate-100/50 transition-colors">
                      <img
                        src={product.imageUrl || 'https://placehold.co/400x400?text=Nexis+Asset'}
                        alt={product.name}
                        loading="lazy"
                        className="max-h-full max-w-full object-contain drop-shadow-xl transition-transform duration-700 group-hover:scale-110"
                      />
                      
                      {/* Interaction Overlay */}
                      <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100">
                         <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black text-indigo-600 uppercase tracking-widest translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            Inspect Asset
                         </div>
                      </div>
                    </div>

                    {/* Content Section - Flex Growing to fill height */}
                    <div className="p-6 flex flex-col flex-1 bg-white">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.2em]">{product.category || 'Standard Node'}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-200"></span>
                        <div className="flex items-center gap-1 group/rating">
                          <Star size={11} className="fill-amber-400 text-amber-400" />
                          <span className="text-[10px] font-black text-slate-500">4.9</span>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2 mb-4 min-h-[56px] group-hover:text-indigo-600 transition-colors">
                        {product.name}
                      </h3>
                      
                      {/* Price & Action - Pushed to Bottom */}
                      <div className="mt-auto flex items-center justify-between pt-5 border-t border-slate-100">
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Exchange Value</p>
                          <p className="text-2xl font-black text-slate-900 tracking-tight">₹{product.price.toLocaleString()}</p>
                        </div>
                        
                        <div className="flex gap-2">
                           <button 
                             onClick={(e) => toggleWishlist(e, product.id)}
                             className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-all border ${wishlist.includes(product.id) ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50'}`}
                           >
                              <Heart size={18} fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} />
                           </button>
                           
                           <div className="h-11 w-11 bg-slate-900 rounded-2xl flex items-center justify-center text-white group-hover:bg-indigo-600 transition-all shadow-xl active:scale-90">
                             <ArrowRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                           </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* WHY NEXIS - FEATURE STRIP */}
      <section className="mt-40 bg-slate-950 py-32 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20">
               <h2 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tighter">Engineered for the Planet</h2>
               <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">Traditional electronics manufacturing is dead. We've built the network layer for a sustainable secondary economy.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               {[
                 { title: "Circular Protocol", desc: "Every device listed on Nexis goes through a 48-point diagnostic verification to ensure it stays in circulation for years.", icon: <ShoppingBag /> },
                 { title: "Vault Protection", desc: "Our end-to-end encrypted payment layer ensures funds are only released when the buyer authorizes receipt.", icon: <ShieldCheck /> },
                 { title: "Carbon Ledger", desc: "Each purchase contributes to real-time carbon offsets, tracked on our global environmental dashboard.", icon: <Leaf /> }
               ].map((feat, i) => (
                 <div key={i} className="space-y-6 group">
                   <div className="h-16 w-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white group-hover:bg-indigo-600 group-hover:shadow-[0_0_30px_rgba(79,70,229,0.3)] transition-all duration-500">{feat.icon}</div>
                   <h4 className="text-2xl font-black text-white">{feat.title}</h4>
                   <p className="text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 mt-40">
        <h2 className="text-4xl font-black text-center mb-16 uppercase tracking-tighter">Core Protocols (FAQ)</h2>
        <div className="space-y-6">
          {[
            { q: "How is condition verified?", a: "Every seller must upload high-resolution diagnostic logs and photographs. Our AI layer Cross-references these against historical data for that specific model." },
            { q: "Is there a warranty?", a: "Unless specified, all certified Nexis sales include a 6-month protocol protection plan covering motherboard and battery failures." },
            { q: "Shipping speed?", a: "Hyper-logistics ensures most tier-1 cities receive assets within 48 hours of authorization." }
          ].map((faq, i) => (
            <div key={i} className="glass-card p-8 hover:bg-white transition-all cursor-default group">
              <h4 className="text-xl font-bold flex justify-between items-center group-hover:text-indigo-600 transition-colors">
                {faq.q}
                <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
              </h4>
              <p className="mt-4 text-slate-500 font-medium leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-black text-xs uppercase tracking-[0.4em]">Establishing Uplink...</p>
      </div>
    }>
      <ProductBrowser />
    </Suspense>
  );
}
