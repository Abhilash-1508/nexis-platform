"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Settings, 
  ShieldAlert, 
  ArrowLeft,
  Search,
  Bell,
  User as UserIcon
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('nexis_user');
    if (!userStr) {
      router.push('/');
      return;
    }
    
    try {
      const user = JSON.parse(userStr);
      if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
        router.push('/'); 
      } else {
        setIsAuthorized(true);
        setAdminUser(user);
      }
    } catch (e) {
      router.push('/');
    }
  }, [router]);

  if (!isAuthorized) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Verifying Authorization Token...</p>
    </div>
  );

  const menuItems = [
    { name: 'Analytics', href: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'User Management', href: '/admin/users', icon: <Users size={20} /> },
    { name: 'Inventory Management', href: '/admin/products', icon: <Package size={20} /> },
    { name: 'Security Settings', href: '/admin/security', icon: <ShieldAlert size={20} /> },
    { name: 'App Settings', href: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* SIDEBAR - MODERN DARK DESIGN */}
      <aside className="w-72 bg-slate-950 text-white flex flex-col shadow-2xl relative z-20">
        <div className="p-8 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="font-black italic text-xl">N</span>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-none uppercase">Admin</h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Protocol Engine v4.0</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4">Operations</p>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 translate-x-1' : 'text-slate-500 hover:text-white hover:bg-white/5 hover:translate-x-1'}`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-600'}>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
          
          <div className="pt-10 space-y-2">
            <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4">Return</p>
            <Link href="/" className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all">
              <ArrowLeft size={20} />
              Exit Marketplace
            </Link>
          </div>
        </nav>

        <div className="p-6 border-t border-white/5 bg-slate-900/50">
           <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center font-black">
                {adminUser?.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-sm font-bold truncate">{adminUser?.name}</p>
                 <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{adminUser?.role}</p>
              </div>
           </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-20 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-6 flex-1">
             <div className="relative max-w-sm w-full hidden md:block">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Global search telemetry..." className="w-full bg-slate-100 border-none pl-12 pr-4 py-2.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20" />
             </div>
          </div>
          
          <div className="flex items-center gap-4">
             <button className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-rose-500 border-2 border-white"></span>
             </button>
             <button className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                <UserIcon size={20} />
             </button>
          </div>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8"
        >
           {children}
        </motion.div>
      </main>
    </div>
  );
}
