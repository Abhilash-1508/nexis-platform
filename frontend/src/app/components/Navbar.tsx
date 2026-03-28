"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ShoppingCart, 
  User, 
  PlusCircle, 
  LayoutDashboard, 
  LogOut, 
  ChevronDown,
  Package,
  Heart,
  Settings,
  Bell,
  Hexagon,
  Menu,
  X,
  ArrowLeft
} from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<{name: string, role?: string, email?: string} | null>(null);
  const [navSearch, setNavSearch] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const { cartCount } = useCart();

  const handleNavSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/?q=${encodeURIComponent(navSearch)}`);
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const userStr = localStorage.getItem('nexis_user');
    if (userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        setUser(parsedUser);
      } catch (e) {
        console.error("Error parsing user", e);
      }
    }

    const updateWishlist = () => {
       const saved = localStorage.getItem('nexis_wishlist');
       if (saved) setWishlistCount(JSON.parse(saved).length);
       else setWishlistCount(0);
    };
    updateWishlist();
    window.addEventListener('storage', updateWishlist);
    return () => window.removeEventListener('storage', updateWishlist);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('nexis_user');
    setUser(null);
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    window.location.href = '/';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-slate-50/98 backdrop-blur-3xl border-b border-slate-200 shadow-sm transition-all duration-500 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4 md:gap-8">
          
          {/* LEFT: Branding */}
          <div className="flex-shrink-0">
            <Link href="/" className="group flex items-center gap-2.5">
              <div className="w-10 h-10 md:w-11 md:h-11 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-500">
                <Hexagon size={20} className="text-white fill-slate-700 group-hover:fill-slate-500 transition-colors md:size-[22px]" />
              </div>
              <span className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900 group-hover:opacity-80 transition-opacity">
                Nexis<span className="text-slate-400">.</span>
              </span>
            </Link>
          </div>

          {/* CENTER: Search */}
          <div className="hidden lg:block flex-1 max-w-2xl px-4">
            <form onSubmit={handleNavSearch} className="relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-600 transition-colors">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-[1.25rem] pl-14 pr-4 py-4 text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950/5 focus:border-slate-400 transition-all shadow-sm"
                placeholder="Find assets..."
              />
            </form>
          </div>

          {/* RIGHT: Action Clusters */}
          <div className="flex items-center gap-2 md:gap-6">
            <div className="hidden md:flex items-center gap-1 md:gap-4 mr-2">
              <Link href="/wishlist" className="relative p-3 rounded-2xl text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all group">
                <Heart size={24} className={wishlistCount > 0 ? "fill-slate-900 text-slate-900" : ""} />
                <AnimatePresence>
                  {wishlistCount > 0 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute top-1.5 right-1.5 h-4 w-4 flex items-center justify-center rounded-full bg-slate-900 text-[9px] font-black text-white ring-4 ring-slate-50 shadow-md">
                      {wishlistCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              <Link href="/cart" className="relative p-3 rounded-2xl text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all group">
                <ShoppingCart size={24} />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute top-1.5 right-1.5 h-4 w-4 flex items-center justify-center rounded-full bg-slate-900 text-[9px] font-black text-white ring-4 ring-slate-50 shadow-md">
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </div>

            <div className="h-10 w-px bg-slate-200 hidden sm:block"></div>

            <div className="hidden md:block">
              {user ? (
                <div className="relative">
                  <button onClick={() => setIsProfileOpen(!isProfileOpen)} className={`flex items-center gap-4 py-2 px-2 md:pl-4 md:pr-2 rounded-[1.25rem] transition-all hover:bg-slate-200 ${isProfileOpen ? 'bg-slate-200' : 'bg-transparent'}`}>
                    <div className="flex flex-col items-end leading-tight mr-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Hello, {user.name.split(' ')[0]}</span>
                      <span className="text-xs font-black text-slate-900 uppercase italic tracking-tighter">Personnel</span>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white ring-4 ring-slate-200 shadow-md overflow-hidden relative">
                       <span className="text-xs font-black relative z-10">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                  </button>
                  <AnimatePresence>
                    {isProfileOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                        <motion.div initial={{ opacity: 0, y: 15, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 mt-4 w-64 p-3 z-20 shadow-2xl bg-white border border-slate-200 rounded-[2rem]">
                          <div className="px-5 py-5 bg-slate-50 rounded-2xl mb-3 flex items-center gap-4 border border-slate-100">
                             <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-900 font-black text-lg border border-slate-200">{user.name.charAt(0).toUpperCase()}</div>
                             <div className="flex-1 overflow-hidden"><p className="text-sm font-black text-slate-900 truncate tracking-tight">{user.name}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Access Verified</p></div>
                          </div>
                          <div className="space-y-1 font-bold">
                            {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                              <Link href="/admin/dashboard" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"><LayoutDashboard size={18} />Admin Engine</Link>
                            )}
                            <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"><Settings size={18} />Registry</Link>
                            <Link href="/profile#orders" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"><Package size={18} />Orders</Link>
                            <div className="h-px bg-slate-100 my-2"></div>
                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50 transition-all"><LogOut size={18} />Logout</button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href="/login" className="flex items-center gap-4 group">
                  <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white group-hover:bg-slate-800 transition-all shadow-lg"><User size={20} /></div>
                  <div className="flex flex-col items-start leading-tight font-black uppercase">
                      <span className="text-[10px] text-slate-500 tracking-widest">Security</span>
                      <span className="text-xs text-slate-900 group-hover:text-slate-600 transition-colors">Login</span>
                  </div>
                </Link>
              )}
            </div>

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-3 md:hidden rounded-2xl bg-slate-200 text-slate-900 hover:bg-slate-300 transition-colors">
               {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
         {isMobileMenuOpen && (
           <motion.div initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }} className="fixed inset-0 z-50 bg-slate-50 p-8 pt-24 font-bold overflow-y-auto">
              <div className="space-y-8">
                 <form onSubmit={handleNavSearch} className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input type="text" value={navSearch} onChange={(e) => setNavSearch(e.target.value)} className="w-full pl-16 pr-6 py-5 bg-white border border-slate-200 rounded-2xl font-bold outline-none" placeholder="Find assets..." />
                 </form>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center gap-4 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
                       <div className="relative"><ShoppingCart size={32} className="text-slate-900" />{cartCount > 0 && <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-[10px] h-6 w-6 rounded-full flex items-center justify-center font-black ring-4 ring-white">{cartCount}</span>}</div>
                       <span className="text-xs uppercase tracking-widest text-slate-500">Cart</span>
                    </Link>
                    <Link href="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center gap-4 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
                       <div className="relative"><Heart size={32} className={wishlistCount > 0 ? "fill-slate-900 text-slate-900" : "text-slate-900"} />{wishlistCount > 0 && <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-[10px] h-6 w-6 rounded-full flex items-center justify-center font-black ring-4 ring-white">{wishlistCount}</span>}</div>
                       <span className="text-xs uppercase tracking-widest text-slate-500">Saved</span>
                    </Link>
                 </div>

                 <div className="space-y-4 pt-8 border-t border-slate-200">
                    <Link href="/sell" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 text-3xl font-black text-slate-900 uppercase tracking-tighter hover:translate-x-2 transition-transform">List Assets <PlusCircle size={32} /></Link>
                    {user ? (
                      <>
                        <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 text-3xl font-black text-slate-900 uppercase tracking-tighter hover:translate-x-2 transition-transform">Registry <User size={32} /></Link>
                        <button onClick={handleLogout} className="flex items-center gap-4 text-3xl font-black text-rose-600 uppercase tracking-tighter hover:translate-x-2 transition-transform">Logout <LogOut size={32} /></button>
                      </>
                    ) : (
                      <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 text-4xl font-black text-slate-900 uppercase tracking-tighter italic underline underline-offset-8">Authorize <ArrowLeft className="rotate-180" size={36} /></Link>
                    )}
                 </div>
              </div>
           </motion.div>
         )}
      </AnimatePresence>
    </nav>
  );
}
