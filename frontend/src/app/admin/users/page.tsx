"use client";
import { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  Trash2, 
  Edit, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  password?: string;
  role: string;
  userRole?: string;
  deleted: boolean;
  suspended: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phoneNumber: '', password: '', role: '' });
  const [revealedPasswords, setRevealedPasswords] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const getHeaders = () => {
    const userStr = localStorage.getItem('nexis_user');
    const token = userStr ? JSON.parse(userStr).token : '';
    return { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, { headers: getHeaders() });
      const data = await res.json();
      setUsers(data || []);
    } catch (e) {
      toast.error("Telemetry link lost. Could not sync user registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const suspendUser = async (id: number) => {
    if (!confirm('Suspend this user and freeze their listings?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${id}/suspend`, { method: 'PATCH', headers: getHeaders() });
      if (res.ok) {
        toast.success("User protocol suspended.");
        fetchUsers();
      }
    } catch (e) {
      toast.error("Failed to suspend user.");
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm('PERMANENTLY HARD-DELETE this user and wipe their record entirely? This cannot be undone.')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${id}`, { method: 'DELETE', headers: getHeaders() });
      if (res.ok) {
        toast.success("User record eradicated from database.");
        fetchUsers();
      }
    } catch (e) {
      toast.error("Failed to delete user record.");
    }
  };

  const resetPassword = async (id: number) => {
    const newPass = Math.random().toString(36).slice(-10);
    if (!confirm(`Reset password for this user? New temporary password will be: ${newPass}`)) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ password: newPass })
      });
      if (res.ok) {
        toast.success("Password reset protocol success.");
        fetchUsers();
      }
    } catch (e) {
      toast.error("Reset failed.");
    }
  };

  const togglePasswordVisibility = (id: number) => {
    if (revealedPasswords.includes(id)) {
      setRevealedPasswords(revealedPasswords.filter(pid => pid !== id));
    } else {
      if (confirm("SECURITY WARNING: You are about to reveal a stored password hash. Continue?")) {
        setRevealedPasswords([...revealedPasswords, id]);
        setTimeout(() => {
          setRevealedPasswords(prev => prev.filter(pid => pid !== id));
        }, 15000); // Auto-hide after 15s
      }
    }
  };

  const startEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({ name: user.name, email: user.email || '', phoneNumber: user.phoneNumber, password: '', role: user.role });
  };

  const saveEdit = async () => {
    if (!editingUser) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
          toast.success("User identity updated.");
          setEditingUser(null);
          fetchUsers();
      } else {
          toast.error("Registry update failed.");
      }
    } catch (e) {
      toast.error("Connection error.");
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.phoneNumber.includes(searchQuery) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">User Registry</h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Personnel management & security protocol</p>
        </div>
        
        <div className="relative group min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by identity/contact..."
            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card bg-white overflow-hidden shadow-premium border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Asset ID</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Personnel Identity</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Encrypted Hash</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Clearance</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Node Status</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-right">Action Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 italic font-medium">
              <AnimatePresence>
                {filteredUsers.map((u, idx) => (
                  <motion.tr 
                    key={u.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <span className="text-xs font-black text-slate-400 font-mono">#{u.id}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900 leading-tight">{u.name}</span>
                        <span className="text-[10px] text-slate-500 font-bold">{u.email}</span>
                        <span className="text-[10px] text-indigo-600 font-black tracking-widest uppercase mt-1">{u.phoneNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <code className="bg-slate-100 px-3 py-1.5 rounded-xl text-[10px] text-rose-600 font-mono truncate max-w-[120px]">
                          {revealedPasswords.includes(u.id) ? u.password : '••••••••••••••••'}
                        </code>
                        <button 
                          onClick={() => togglePasswordVisibility(u.id)}
                          className="text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          {revealedPasswords.includes(u.id) ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${u.role === 'ADMIN' || u.role === 'SUPER_ADMIN' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {u.deleted ? (
                        <div className="flex items-center gap-2 text-rose-600">
                          <XCircle size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Wiped</span>
                        </div>
                      ) : u.suspended ? (
                        <div className="flex items-center gap-2 text-amber-500">
                          <AlertCircle size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Halted</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-emerald-500">
                          <CheckCircle2 size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Uplinked</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => startEdit(u)} className="h-9 w-9 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl flex items-center justify-center transition-all shadow-sm border border-emerald-100" title="Edit Profile"><Edit size={16} /></button>
                        <button onClick={() => resetPassword(u.id)} className="h-9 w-9 bg-sky-50 text-sky-600 hover:bg-sky-600 hover:text-white rounded-xl flex items-center justify-center transition-all shadow-sm border border-sky-100" title="Hard Reset"><RefreshCw size={16} /></button>
                        <button onClick={() => suspendUser(u.id)} disabled={u.role === 'ADMIN' || u.deleted || u.suspended} className="h-9 w-9 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white rounded-xl flex items-center justify-center transition-all shadow-sm border border-amber-100 disabled:opacity-20 disabled:cursor-not-allowed" title="Freeze Node"><ShieldAlert size={16} /></button>
                        <button onClick={() => deleteUser(u.id)} disabled={u.role === 'ADMIN' || u.deleted} className="h-9 w-9 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl flex items-center justify-center transition-all shadow-sm border border-rose-100 disabled:opacity-20 disabled:cursor-not-allowed" title="Eradicate"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] p-10 w-full max-w-lg border border-slate-200"
            >
              <h2 className="text-3xl font-black text-slate-900 mb-2 italic uppercase tracking-tighter">Adjust Identity</h2>
              <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-10 border-b border-slate-100 pb-4">Personnel Registry Modification</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Legal Name</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Email Protocol</label>
                    <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Network Handle</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none" value={editForm.phoneNumber} onChange={e => setEditForm({...editForm, phoneNumber: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Manual Hash Override</label>
                  <input type="password" placeholder="Leave empty to maintain existing hash..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none" value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} />
                </div>
              </div>
              
              <div className="mt-12 flex items-center justify-end gap-4">
                <button onClick={() => setEditingUser(null)} className="px-8 py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-600 transition-colors">Abort</button>
                <button onClick={saveEdit} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95">Commit Changes</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
