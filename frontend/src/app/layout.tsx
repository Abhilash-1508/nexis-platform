import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import Navbar from './components/Navbar';
import AIChatbot from './components/AIChatbot';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <title>Nexis | The Next-Gen Tech Marketplace</title>
        <meta name="description" content="Buy and sell refurbished electronics and goods securely." />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white`} suppressHydrationWarning={true}>
        <CartProvider>
          <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#1e293b', color: '#fff', borderRadius: '16px', fontWeight: 'bold' } }} />
          <Navbar />
          <AIChatbot />

          {/* Main Content Areas */}
          <main className="min-h-screen">
            {children}
          </main>
        </CartProvider>

        {/* Premium Nexis Footer */}
        <footer className="relative bg-slate-950 text-white pt-32 pb-16 overflow-hidden border-t border-white/5">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
              
              <div className="space-y-8">
                <Link href="/" className="text-3xl font-black tracking-tighter flex items-center gap-1 group">
                   Nexis<span className="text-indigo-500 group-hover:animate-pulse">.</span>
                </Link>
                <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs">
                  The mission-critical layer for the global circular tech economy. Verified assets, secured by protocol.
                </p>
                <div className="flex gap-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-10 w-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:border-indigo-500 transition-all cursor-pointer group">
                       <div className="h-4 w-4 bg-slate-400 group-hover:bg-white transition-colors"></div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 font-mono">Operations</h4>
                <ul className="space-y-4">
                  <li><Link href="/about" className="text-sm font-bold text-slate-500 hover:text-white transition-colors">Platform Vision</Link></li>
                  <li><Link href="/sell" className="text-sm font-bold text-slate-500 hover:text-white transition-colors">Merchant Portal</Link></li>
                  <li><Link href="/careers" className="text-sm font-bold text-slate-500 hover:text-white transition-colors">Engineers</Link></li>
                  <li><Link href="/about" className="text-sm font-bold text-slate-500 hover:text-white transition-colors">Environmental Ledger</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 font-mono">Protocols</h4>
                <ul className="space-y-4">
                  <li><Link href="/help" className="text-sm font-bold text-slate-500 hover:text-white transition-colors">Vault Protection</Link></li>
                  <li><Link href="/returns" className="text-sm font-bold text-slate-500 hover:text-white transition-colors">Return Policy</Link></li>
                  <li><Link href="/help" className="text-sm font-bold text-slate-500 hover:text-white transition-colors">Privacy Stack</Link></li>
                  <li><Link href="/help" className="text-sm font-bold text-slate-500 hover:text-white transition-colors">Terms of Service</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 font-mono">Node Status</h4>
                <div className="glass-card p-6 bg-white/5 border-white/10 space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase">Uptime</span>
                      <span className="text-[10px] font-black text-emerald-400 uppercase">99.9%</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase">Latency</span>
                      <span className="text-[10px] font-black text-sky-400 uppercase">12ms</span>
                   </div>
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-gradient-to-r from-indigo-500 to-emerald-500 animate-pulse"></div>
                   </div>
                </div>
              </div>
            </div>

            <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
               <p className="text-xs font-black text-slate-600 uppercase tracking-widest italic">
                  &copy; {new Date().getFullYear()} NEXIS PROTOCOL. ALL RIGHTS RESERVED.
               </p>
               <div className="flex gap-8">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                     <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                     All Systems Functional
                  </span>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors italic">
                     Evolving Always
                  </span>
               </div>
            </div>
          </div>
        </footer>

      </body>

    </html>
  );
}
