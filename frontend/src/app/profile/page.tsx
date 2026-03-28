"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Package, 
  MapPin, 
  ShieldCheck, 
  CreditCard, 
  PhoneCall, 
  LogOut, 
  Settings, 
  ChevronRight, 
  ArrowRight,
  Leaf,
  Droplet,
  Zap,
  CheckCircle2,
  Clock,
  MoreVertical,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AccountCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  color: string;
}

const AccountCard = ({ icon, title, description, link, color }: AccountCardProps) => (
  <motion.a 
    whileHover={{ y: -5 }}
    href={link} 
    className="glass-card flex p-8 bg-white hover:shadow-premium transition-all items-start gap-6 group"
  >
    <div className={`h-14 w-14 rounded-2xl bg-${color}-500/10 text-${color}-600 flex items-center justify-center transition-all group-hover:scale-110 shadow-sm border border-${color}-500/20`}>
       {icon}
    </div>
    <div className="flex-1">
      <h3 className="text-xl font-black text-slate-900 leading-tight mb-1">{title}</h3>
      <p className="text-sm text-slate-500 font-medium leading-relaxed">{description}</p>
    </div>
    <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-950 group-hover:text-white transition-all transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100">
       <ArrowRight size={18} />
    </div>
  </motion.a>
);

function ProfileContent() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: number; name: string; email: string; phoneNumber?: string; mobilePhone?: string; address?: string } | null>(null);
  const [orders, setOrders] = useState<{ id: number; orderDate: string; totalPrice: number; status: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    mobilePhone: '',
    address: '',
    password: ''
  });

  // UI States
  const [isEditingSecurity, setIsEditingSecurity] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [ecoStats, setEcoStats] = useState({ co2: 0, eWaste: 0, water: 0 });

  useEffect(() => {
    const userStr = localStorage.getItem('nexis_user');
    if (!userStr) {
      router.push('/login');
      return;
    }

    const u = JSON.parse(userStr);
    const token = u.token;
    
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${u.id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/user/${u.id}`, { headers: { 'Authorization': `Bearer ${token}` } })
    ])
    .then(async ([userRes, orderRes]) => {
      if (!userRes.ok || !orderRes.ok) throw new Error("Synchronization Error");
      
      const userData = await userRes.json();
      const orderData = await orderRes.json();

      setUser(userData);
      setOrders(orderData || []);

      const validOrders = (orderData || []).filter((o: any) => o.status === 'COMPLETED' || o.status === 'DELIVERED');
      
      // Calculate Environmental Impact - Multi-factor
      let totalCo2 = validOrders.length * 12.5;
      let totalEwaste = validOrders.length * 0.8;
      let totalWater = validOrders.length * 3200;
      
      setEcoStats({ co2: totalCo2, eWaste: totalEwaste, water: totalWater });
      
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
        mobilePhone: userData.mobilePhone || '',
        address: userData.address || '',
        password: ''
      });
      setLoading(false);
    })
    .catch(err => {
      toast.error("Telemetry failed to pull data.");
      setLoading(false);
    });
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const u = JSON.parse(localStorage.getItem('nexis_user') || '{}');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${u.token}`
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updated = await response.json();
        setUser(updated);
        localStorage.setItem('nexis_user', JSON.stringify({
           ...updated,
           token: u.token
        }));
        setIsEditingSecurity(false);
        setIsEditingAddress(false);
        toast.success("Identity Vault Updated.");
      } else {
        toast.error("Write Protocol Failure.");
      }
    } catch (err) {
      toast.error("Network Severed.");
    }
  };

  const logout = () => {
    localStorage.removeItem('nexis_user');
    toast.success("Session Terminated.");
    window.location.href = '/';
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        
        <nav className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">
           <Link href="/" className="hover:text-indigo-600 transition-colors">Nexus Storefront</Link>
           <ChevronRight size={10} />
           <span className="text-slate-900">Your Account</span>
        </nav>

        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div>
               <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase leading-none underline decoration-indigo-500/10 underline-offset-8 decoration-4">IDENTITY VAULT</h1>
               <p className="text-slate-500 font-bold text-sm tracking-tight mt-2 uppercase">Authenticated: <span className="text-indigo-600">{user?.name}</span></p>
            </div>
            <button onClick={logout} className="flex items-center gap-3 px-8 py-3.5 bg-rose-50 text-rose-600 rounded-2xl font-black uppercase text-xs hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-rose-100">
               <LogOut size={18} />
               De-Authorize Session
            </button>
        </div>

        {/* ECO-IMPACT WIDGET - PREMIUM REIMAGINED */}
        <motion.div 
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           className="mb-16 rounded-[2.5rem] overflow-hidden bg-slate-950 shadow-premium relative group"
        >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-[80px] translate-y-1/4 -translate-x-1/4"></div>
          
          <div className="relative p-10 md:p-16 text-white flex flex-col lg:flex-row items-center justify-between gap-12">
             <div className="flex-1 max-w-lg text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-6 border border-white/10 text-emerald-400">
                  <Leaf size={14} className="animate-pulse" />
                  Asset Preservationist
                </div>
                <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter italic uppercase">Eco-Audit Reports</h2>
                <p className="text-slate-400 font-medium text-lg leading-relaxed">Your choice to utilize the Nexis Protocol for technology assets has saved critical planetary resources from industrial extraction.</p>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full lg:w-auto">
                <div className="glass-card bg-white/5 border-white/10 p-8 text-center shadow-lg group-hover:bg-white/10 transition-all cursor-default scale-100 group-hover:scale-105 duration-500">
                   <div className="text-3xl mb-3 text-emerald-400 flex justify-center"><Zap size={40} className="animate-float" /></div>
                   <div className="text-5xl font-black text-white tracking-tighter">{ecoStats.co2.toFixed(1)} <span className="text-lg opacity-40">KG</span></div>
                   <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-2">CO₂ Prevented</div>
                </div>
                <div className="glass-card bg-white/5 border-white/10 p-8 text-center shadow-lg group-hover:bg-white/10 transition-all cursor-default scale-100 group-hover:scale-110 duration-500 [animation-delay:0.2s]">
                   <div className="text-3xl mb-3 text-sky-400 flex justify-center"><Package size={40} className="animate-float" /></div>
                   <div className="text-5xl font-black text-white tracking-tighter">{ecoStats.eWaste.toFixed(2)} <span className="text-lg opacity-40">KG</span></div>
                   <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-2">E-Waste Redirected</div>
                </div>
                <div className="glass-card bg-white/5 border-white/10 p-8 text-center shadow-lg group-hover:bg-white/10 transition-all cursor-default scale-100 group-hover:scale-105 duration-500">
                   <div className="text-3xl mb-3 text-indigo-400 flex justify-center"><Droplet size={40} className="animate-float" /></div>
                   <div className="text-5xl font-black text-white tracking-tighter">{ecoStats.water > 1000 ? (ecoStats.water/1000).toFixed(1) + 'K' : ecoStats.water.toFixed(0)} <span className="text-lg opacity-40">L</span></div>
                   <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-2">Water Protected</div>
                </div>
             </div>
          </div>
        </motion.div>

        {/* CORE ACTION GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20 animate-in fade-in slide-in-from-bottom-5 duration-500">
          <AccountCard icon={<Package />} title="Order History" description="Track asset transit and authorization status" link="#orders" color="indigo" />
          <AccountCard icon={<ShieldCheck />} title="Protocol Security" description="Edit login identifiers and mobile keys" link="#security" color="emerald" />
          <AccountCard icon={<MapPin />} title="Coordinate Registry" description="Update global delivery destinations" link="#address" color="sky" />
          <AccountCard icon={<CreditCard />} title="Payment Vaults" description="Manage authorized transaction methods" link="#payments" color="rose" />
          <AccountCard icon={<PhoneCall />} title="Command Center" description="Instant link to Nexis Support Agents" link="#" color="amber" />
          <AccountCard icon={<Settings />} title="Protocol Setup" description="Configure telemetry and alert settings" link="#" color="slate" />
        </div>

        <div className="space-y-20">
          
          {/* SECTION: ORDER TRACKING */}
          <section id="orders" className="glass-card bg-white overflow-hidden shadow-premium">
            <div className="px-10 py-6 border-b bg-slate-50 flex justify-between items-center">
               <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                 <Package className="text-indigo-600" /> Distributed Orders
               </h2>
               <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{orders.length} ACTIVE ARTIFACTS</span>
            </div>
            <div className="p-10">
               {orders.length === 0 ? (
                 <div className="text-center py-24 flex flex-col items-center">
                    <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-[2rem] flex items-center justify-center mb-8 rotate-12"><Package size={40} /></div>
                    <p className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight italic">Registry Empty</p>
                    <p className="text-slate-400 font-medium mb-8">No order transmissions found on this identity.</p>
                    <Link href="/" className="btn-premium px-10 flex items-center gap-2">Explore Marketplace <Plus size={18} /></Link>
                 </div>
               ) : (
                  <div className="space-y-6">
                   {orders.map((order) => (
                     <div key={order.id} className="glass-card bg-slate-50 border-slate-100 p-8 flex flex-col lg:flex-row justify-between items-center gap-10 hover:bg-white transition-all group">
                        <div className="flex items-center gap-8 flex-1">
                           <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-3xl shadow-xl group-hover:scale-110 transition-transform -rotate-6">📦</div>
                           <div className="space-y-1">
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                 <Clock size={12} className="text-indigo-500" />
                                 Sync'd: {new Date(order.orderDate).toLocaleDateString()}
                              </div>
                              <div className="font-black text-2xl text-slate-900 tracking-tighter italic uppercase">Protocol Alpha #{order.id}</div>
                              <div className="flex items-center gap-4 pt-2">
                                 <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-200">{order.status}</span>
                                 <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><CheckCircle2 size={14} className="text-emerald-500" /> Logistics Secured</span>
                              </div>
                           </div>
                        </div>
                        <div className="text-center lg:text-right space-y-2">
                           <div className="text-4xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">₹{order.totalPrice?.toLocaleString()}</div>
                           <button className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-2">Access Lifecycle <ArrowRight size={14} /></button>
                        </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          </section>

          {/* SECTION: SECURITY & IDENTITY */}
          <section id="security" className="glass-card bg-white overflow-hidden shadow-premium">
            <div className="px-10 py-6 border-b bg-slate-50 flex justify-between items-center">
               <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                 <ShieldCheck className="text-emerald-600" /> Identity Protocols
               </h2>
               <button onClick={() => setIsEditingSecurity(!isEditingSecurity)} className="h-10 w-10 glass-card bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-all">
                  <Settings size={20} className={isEditingSecurity ? 'animate-spin' : ''} />
               </button>
            </div>
            <div className="p-10 relative">
               <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Identifier: Name</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} disabled={!isEditingSecurity} className="w-full h-16 px-6 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-bold transition-all disabled:opacity-50" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Communication: Email</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} disabled={!isEditingSecurity} className="w-full h-16 px-6 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-bold transition-all disabled:opacity-50" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Auth ID: Login</label>
                    <input type="text" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} disabled={!isEditingSecurity} className="w-full h-16 px-6 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-bold transition-all disabled:opacity-50" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">SMS Key: Verified Mobile</label>
                    <input type="tel" value={formData.mobilePhone} onChange={e => setFormData({...formData, mobilePhone: e.target.value})} disabled={!isEditingSecurity} className="w-full h-16 px-6 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-bold transition-all disabled:opacity-50" placeholder="+91 XXXXX XXXXX" />
                  </div>
                  
                  {isEditingSecurity && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2 flex justify-end">
                      <button type="submit" className="btn-premium px-12">Write Identity Changes</button>
                    </motion.div>
                  )}
               </form>
            </div>
          </section>

          {/* SECTION: ADDRESS REGISTRY */}
          <section id="address" className="glass-card bg-white overflow-hidden shadow-premium mb-12">
            <div className="px-10 py-6 border-b bg-slate-50 flex justify-between items-center">
               <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                 <MapPin className="text-sky-600" /> Coordinate Registry
               </h2>
               <button onClick={() => setIsEditingAddress(!isEditingAddress)} className="h-10 w-10 glass-card bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-all">
                  <ArrowRight size={20} className={isEditingAddress ? 'rotate-90 transition-transform' : ''} />
               </button>
            </div>
            <div className="p-10">
               <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Primary Navigation Node (Address)</label>
                  <textarea rows={4} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} disabled={!isEditingAddress} className="w-full px-8 py-6 rounded-3xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-bold transition-all disabled:opacity-50 text-xl leading-relaxed resize-none" placeholder="123 Sector-7, Industrial Nexus, Neo City..." />
               </div>
               {isEditingAddress && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end mt-8">
                   <button onClick={handleUpdate} className="btn-premium px-12">Finalize Coordinates</button>
                 </motion.div>
               )}
            </div>
          </section>

          {/* PAYMENT SECTION - FALLBACK */}
          <section id="payments" className="glass-card bg-slate-950 p-12 shadow-premium flex flex-col items-center text-center">
             <div className="h-20 w-32 bg-indigo-600/20 rounded-3xl flex items-center justify-center text-indigo-400 mb-8 border border-white/10 group animate-pulse">
                <CreditCard size={48} className="group-hover:scale-110 transition-transform" />
             </div>
             <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Secured Vault Layer</h3>
             <p className="text-slate-500 font-medium max-w-sm mb-10 leading-relaxed uppercase text-[10px] tracking-[0.2em] font-black">All financial payloads are processed via Nexis Authorization Protocol 4.0. No keys are stored permanently.</p>
             <button className="px-12 py-5 bg-white text-slate-950 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition shadow-2xl">Manage Authorized Tunnels</button>
          </section>

        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Accessing Identity Layer...</p>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
