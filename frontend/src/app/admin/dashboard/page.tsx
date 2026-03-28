"use client";
import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Package, 
  AlertTriangle, 
  IndianRupee, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface DashboardStats {
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  activeListings: number;
  suspendedUsers: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('nexis_user');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`, {
      headers: {
        'Authorization': `Bearer ${user.token || ''}`,
      }
    })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, []);

  if (!stats) return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-400 font-bold text-sm">Loading dashboard data...</p>
    </div>
  );

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        fill: true,
        label: 'Platform Revenue (₹)',
        data: [120000, 190000, 150000, 250000, 220000, 300000, stats.totalRevenue || 400000],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { size: 14, weight: 'bold' as const },
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      y: { display: false },
      x: { 
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { weight: 'bold' as const } }
      }
    }
  };

  const handleGenerateReport = async () => {
    try {
      const userStr = localStorage.getItem('nexis_user');
      const user = JSON.parse(userStr || '{}');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/report`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nexis-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.success("Platform report generated successfully.");
      } else {
        toast.error("Failed to compile system report.");
      }
    } catch (e) {
      toast.error("Telemetry link lost.");
    }
  };

  const cards = [
    { title: 'Gross Revenue', value: `₹${stats.totalRevenue?.toLocaleString()}`, trend: '+12.5%', icon: <IndianRupee size={24} />, color: 'indigo' },
    { title: 'Total Users', value: stats.totalUsers, trend: '+4.2%', icon: <Users size={24} />, color: 'sky' },
    { title: 'Total Products', value: stats.totalProducts, trend: '+18.1%', icon: <Package size={24} />, color: 'emerald' },
    { title: 'Flagged Users', value: stats.suspendedUsers, trend: '-2.5%', icon: <AlertTriangle size={24} />, color: 'rose' },
  ];

  return (
    <div className="space-y-12">
      
      <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Admin Dashboard</h1>
            <p className="text-slate-500 font-bold text-sm tracking-tight mt-1">Overview of platform performance and revenue.</p>
          </div>
         <button 
          onClick={handleGenerateReport}
          className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black flex items-center gap-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20 active:scale-95"
         >
            <TrendingUp size={18} />
            Generate Report
         </button>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-6 bg-white hover:shadow-premium transition-all relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${card.color}-500/5 rounded-full blur-3xl group-hover:bg-${card.color}-500/10 transition-all`}></div>
            <div className="flex justify-between items-start mb-6">
              <div className={`h-12 w-12 rounded-2xl bg-${card.color}-500/10 text-${card.color}-600 flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm border border-${card.color}-500/20`}>
                {card.icon}
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black uppercase ${card.trend.startsWith('+') ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'} px-2 py-1 rounded-full border border-current opacity-70`}>
                {card.trend.startsWith('+') ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {card.trend}
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{card.title}</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CHART SECTION */}
        <div className="lg:col-span-2 glass-card p-8 bg-white shadow-premium flex flex-col h-[480px]">
           <div className="flex justify-between items-center mb-8">
              <div>
                 <h3 className="text-xl font-bold uppercase text-slate-900 flex items-center gap-2">
                   <TrendingUp className="text-indigo-600" size={20} />
                   Revenue Overview
                 </h3>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Monthly revenue tracking</p>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                 <button className="px-4 py-1.5 bg-white shadow-sm rounded-lg text-xs font-black text-slate-900 uppercase">Weekly</button>
                 <button className="px-4 py-1.5 text-xs font-black text-slate-400 uppercase hover:text-slate-600">Monthly</button>
              </div>
           </div>
           
           <div className="flex-1 w-full relative">
              <Line data={chartData} options={chartOptions} />
           </div>
        </div>

        {/* SYSTEM STATUS SECTION */}
        <div className="glass-card p-8 bg-slate-900 text-white shadow-premium flex flex-col h-[480px]">
           <h3 className="text-xl font-bold uppercase text-white flex items-center gap-2 mb-8">
              <Activity className="text-emerald-500" size={20} />
              System Status
           </h3>
           
           <div className="space-y-6">
              {[
                { label: 'Network Throughput', value: 'High', color: 'emerald' },
                { label: 'API Latency', value: '12ms', color: 'sky' },
                { label: 'Auth Handshakes', value: '99.9%', color: 'emerald' },
                { label: 'Storage Cluster', value: 'Optimal', color: 'emerald' },
                { label: 'Security Firewall', value: 'Active', color: 'emerald' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center group">
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-widest transition-colors group-hover:text-white">{item.label}</span>
                   <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase text-${item.color}-400 border border-${item.color}-500/30 group-hover:bg-${item.color}-500 group-hover:text-white transition-all`}>{item.value}</span>
                </div>
              ))}
           </div>
           
           <div className="mt-auto p-5 bg-white/5 rounded-2xl border border-white/10 text-center flex flex-col items-center">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">System Load</div>
              <div className="text-4xl font-black text-emerald-400 tracking-tighter">0.14<span className="text-lg opacity-40 ml-1">%</span></div>
              <p className="text-slate-500 text-[10px] mt-2 leading-tight uppercase font-bold tracking-widest">All systems are running normally.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
