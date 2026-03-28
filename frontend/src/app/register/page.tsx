"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    mobilePhone: '',
    password: ''
  });
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const validateAuth = () => {
     // Email
     const email = formData.email;
     if (!email.includes('@') || !email.includes('.')) {
        return "Email must be a valid email containing '@' and '.'.";
     }
     if (!/[a-zA-Z]/.test(email) || !/[0-9]/.test(email)) {
        return "Email prefix should contain at least one letter and one number to meet strict username requirements.";
     }

     const pwd = formData.password;
     if (!pwd) return "Password cannot be empty.";
     if (pwd.length < 8) return "Password must be at least 8 characters.";
     if (!/[A-Z]/.test(pwd)) return "Password must contain an uppercase letter.";
     if (!/[a-z]/.test(pwd)) return "Password must contain a lowercase letter.";
     if (!/[0-9]/.test(pwd)) return "Password must contain a number.";
     if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return "Password must contain a special character.";

     if (!formData.name) return "Name cannot be empty.";
     if (!formData.phoneNumber) return "Phone number cannot be empty.";
     if (!formData.mobilePhone) return "Mobile phone for SMS cannot be empty.";
     if (!/^\+\d{7,15}$/.test(formData.mobilePhone)) return "Mobile phone must be in E.164 format, e.g. +919876543210";

     return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateAuth();
    if (validationError) {
       setErrorMsg(validationError);
       return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const user = await response.json();
        localStorage.setItem('nexis_user', JSON.stringify(user));
        alert("Registration successful!");
        window.location.href = '/'; 
      } else {
        setErrorMsg("Registration failed. A user with this phone number might already exist.");
      }
    } catch (error) {
      console.error("Error registering:", error);
      setErrorMsg("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-[16rem])] bg-slate-50 flex flex-col justify-center py-24 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-4xl font-black text-slate-900 tracking-tighter uppercase italic mb-2">
           Node Enrollment
        </h2>
        <p className="text-center text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-10">Initialize Your Identity Protocol</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-12 px-10 shadow-premium sm:rounded-[2.5rem] border border-slate-100">
          {errorMsg && <div className="mb-8 text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 p-4 rounded-xl border border-rose-100">{errorMsg}</div>}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Personnel Identity</label>
              <div className="mt-1">
                <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} placeholder="John Doe" className="appearance-none block w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Email Protocol</label>
                <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="user123@example.com" className="appearance-none block w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none" />
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Network Handle</label>
                <input id="phoneNumber" name="phoneNumber" type="text" required value={formData.phoneNumber} onChange={handleChange} placeholder="user123" className="appearance-none block w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none" />
              </div>
            </div>

            <div>
              <label htmlFor="mobilePhone" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Comms Channel <span className="opacity-40 italic">(E.164 Format)</span></label>
              <input id="mobilePhone" name="mobilePhone" type="tel" required value={formData.mobilePhone} onChange={handleChange} placeholder="+919876543210" className="appearance-none block w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none" />
              <p className="mt-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Required for order verification & sale telemetry.</p>
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Access Key</label>
              <div className="mt-1 relative">
                <input 
                  id="password" 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={formData.password} 
                  onChange={handleChange} 
                  placeholder="••••••••" 
                  className="appearance-none block w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <button type="submit" disabled={loading} className="w-full flex justify-center py-5 px-4 border border-transparent rounded-[1.25rem] shadow-xl text-[10px] font-black uppercase tracking-widest text-slate-900 bg-emerald-400 hover:bg-emerald-500 hover:scale-[1.02] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 active:scale-95 disabled:opacity-50">
                {loading ? 'Enrollment Processing...' : 'Commit Identity'}
              </button>
            </div>
          </form>

          <div className="mt-10">
             <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                <span className="px-4 bg-white text-slate-400">Existing Personnel?</span>
              </div>
             </div>
             <div className="mt-8">
                <Link href="/login" className="w-full flex justify-center py-5 px-4 border border-slate-200 rounded-[1.25rem] shadow-sm text-[10px] font-black uppercase tracking-widest text-slate-900 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all text-center">
                  Sign in to Access Node
                </Link>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
