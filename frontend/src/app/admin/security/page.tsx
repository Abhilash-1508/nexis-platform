"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Mail, 
  Phone, 
  RefreshCw, 
  Save, 
  Key,
  ShieldAlert,
  Edit2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SecuritySettingsPage() {
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: ''
  });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem('nexis_user');
      const u = JSON.parse(userStr || '{}');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${u.id}`, {
        headers: { 'Authorization': `Bearer ${u.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminUser(data);
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          password: ''
        });
      }
    } catch (e) {
      toast.error("Security connection failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userStr = localStorage.getItem('nexis_user');
      const u = JSON.parse(userStr || '{}');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${u.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${u.token}` 
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success("Security profile updated.");
        setIsEditing(false);
        fetchProfile();
      } else {
        toast.error("Auth Fail: Access denied.");
      }
    } catch (e) {
      toast.error("System sync failed.");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
       <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
       <p className="text-slate-400 font-bold text-sm text-center">Loading security settings...</p>
    </div>
 );

  return (
    <div className="space-y-12 max-w-4xl">
      <div className="flex justify-between items-end">
         <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Security Settings</h1>
            <p className="text-slate-500 font-bold text-sm tracking-tight mt-1">Manage your administrative profile and password.</p>
         </div>
         <button 
           onClick={() => setIsEditing(!isEditing)}
           className={`px-6 py-3 rounded-2xl font-black flex items-center gap-2 transition-all shadow-lg active:scale-95 ${isEditing ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-slate-950 text-white shadow-slate-950/20 hover:bg-slate-800'}`}
         >
            {isEditing ? <ShieldAlert size={18} /> : <Edit2 size={18} />}
            {isEditing ? 'Cancel Edit' : 'Edit Credentials'}
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
         <div className="glass-card p-10 bg-white shadow-premium flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-3xl bg-indigo-600 text-white flex items-center justify-center font-black text-4xl shadow-2xl mb-8 rotate-3 transition-transform hover:rotate-6">
                {adminUser?.name?.charAt(0)}
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">{adminUser?.name}</h2>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-6 border border-emerald-500/30 px-3 py-1 rounded-full mt-2">Certified {adminUser?.role}</p>
            <div className="w-full space-y-4 pt-10 border-t border-slate-100">
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Auth Status</span>
                  <span className="font-bold text-emerald-500 flex items-center gap-1"><ShieldCheck size={14} /> ACTIVE</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">System Sync</span>
                  <span className="font-bold text-slate-900">ENCRYPTED</span>
               </div>
            </div>
         </div>

         <div className="md:col-span-1">
            <form onSubmit={handleUpdate} className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Full Name</label>
                  <div className="relative group">
                     <User size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                     <input 
                       disabled={!isEditing} 
                       type="text" 
                       value={formData.name} 
                       onChange={e => setFormData({...formData, name: e.target.value})} 
                       className="w-full pl-16 pr-6 py-4 rounded-2xl bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-bold transition-all disabled:opacity-50 shadow-sm"
                     />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Email Address</label>
                  <div className="relative group">
                     <Mail size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                     <input 
                       disabled={!isEditing} 
                       type="email" 
                       value={formData.email} 
                       onChange={e => setFormData({...formData, email: e.target.value})} 
                       className="w-full pl-16 pr-6 py-4 rounded-2xl bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-bold transition-all disabled:opacity-50 shadow-sm"
                     />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Admin Username (Login Phone)</label>
                  <div className="relative group">
                     <Phone size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                     <input 
                       disabled={!isEditing} 
                       type="text" 
                       value={formData.phoneNumber} 
                       onChange={e => setFormData({...formData, phoneNumber: e.target.value})} 
                       className="w-full pl-16 pr-6 py-4 rounded-2xl bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-bold transition-all disabled:opacity-50 shadow-sm"
                     />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">New Password</label>
                  <div className="relative group">
                     <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                     <input 
                       disabled={!isEditing} 
                       type="password" 
                       placeholder="••••••••••••"
                       value={formData.password} 
                       onChange={e => setFormData({...formData, password: e.target.value})} 
                       className="w-full pl-16 pr-6 py-4 rounded-2xl bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-bold transition-all disabled:opacity-50 shadow-sm"
                     />
                  </div>
               </div>

               <AnimatePresence>
                 {isEditing && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="pt-4"
                   >
                     <button type="submit" className="btn-premium w-full flex items-center justify-center gap-3">
                        <Save size={20} />
                        Save Credentials
                     </button>
                   </motion.div>
                 )}
               </AnimatePresence>
            </form>
         </div>
      </div>

      <div className="glass-card p-10 bg-slate-950 text-white relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 group-hover:bg-emerald-500/20 transition-all duration-700"></div>
         <h3 className="text-2xl font-bold uppercase tracking-tighter italic mb-4 flex items-center gap-3">
            <Key className="text-emerald-400" /> Administrative Access
         </h3>
         <p className="text-slate-400 font-medium mb-8 leading-relaxed">Updating admin credentials may affect platform access. Please notify the relevant team before making changes.</p>
         <div className="flex bg-white/5 border border-white/10 p-2 rounded-2xl gap-2 w-full max-w-sm">
            <input type="text" readOnly value="TLS_1.3_VERIFIED" className="flex-1 bg-transparent border-none text-[10px] font-black text-emerald-500 uppercase px-4 ring-0 focus:ring-0" />
            <div className="px-4 py-2 bg-emerald-500 text-slate-950 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
               <ShieldCheck size={14} /> CERTIFIED
            </div>
         </div>
      </div>
    </div>
  );
}
