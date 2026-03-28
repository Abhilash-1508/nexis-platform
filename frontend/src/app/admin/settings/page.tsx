"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  ShieldCheck, 
  CreditCard, 
  MessageSquare, 
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AppSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('nexis_user') || '{}');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/settings`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setSettings(await res.json());
      }
    } catch (e) {
      toast.error("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdate = async (key: string, value: string) => {
    setSavingKey(key);
    try {
      const user = JSON.parse(localStorage.getItem('nexis_user') || '{}');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/settings/${key}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}` 
        },
        body: JSON.stringify({ value })
      });
      if (res.ok) {
        toast.success(`${key} updated.`);
        setSettings(settings.map(s => s.settingKey === key ? { ...s, settingValue: value } : s));
      } else {
        toast.error("Error: Unauthorized access.");
      }
    } catch (e) {
      toast.error("Connection failed.");
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) return (
     <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold text-sm text-center">Loading system settings...</p>
     </div>
  );

  return (
    <div className="space-y-12 max-w-4xl">
       <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">App Settings</h1>
          <p className="text-slate-500 font-bold text-sm tracking-tight mt-1">Manage platform features and system settings.</p>
       </div>

      <div className="grid grid-cols-1 gap-8">
        {settings.map((setting) => (
          <motion.div 
            key={setting.settingKey}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 bg-white shadow-premium flex flex-col md:flex-row justify-between items-center gap-8 group"
          >
            <div className="flex items-center gap-6 flex-1">
               <div className="h-16 w-16 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-2xl group-hover:bg-indigo-600 transition-colors">
                  {setting.settingKey.includes('PAYMENT') ? <CreditCard size={28} /> : 
                   setting.settingKey.includes('SMS') ? <MessageSquare size={28} /> : 
                   setting.settingKey.includes('MAINTENANCE') ? <ShieldCheck size={28} /> : <Settings size={28} />}
               </div>
               <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">{setting.settingKey.replace(/_/g, ' ')}</h3>
                  <p className="text-sm text-slate-500 font-medium">{setting.description}</p>
               </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
               <div className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={setting.settingValue === 'true'} 
                    onChange={(e) => handleUpdate(setting.settingKey, e.target.checked ? 'true' : 'false')}
                    className="sr-only peer" 
                  />
                  <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600 shadow-inner"></div>
                  <span className="ms-3 text-xs font-black uppercase tracking-widest text-slate-400 peer-checked:text-indigo-600">
                    {setting.settingValue === 'true' ? 'Active' : 'Offline'}
                  </span>
               </div>
               
               {savingKey === setting.settingKey && (
                 <RefreshCw size={16} className="text-indigo-500 animate-spin" />
               )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-10 glass-card bg-slate-950 text-white border-none shadow-premium relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4"></div>
         <h3 className="text-2xl font-bold uppercase tracking-tighter italic mb-4 flex items-center gap-3">
            <Globe className="text-indigo-400" /> System Status
         </h3>
         <p className="text-slate-400 font-medium mb-8 leading-relaxed">Changes are applied immediately across the platform. Please verify all settings before saving.</p>
         <button className="btn-premium px-10">Save All Changes</button>
      </div>
    </div>
  );
}
