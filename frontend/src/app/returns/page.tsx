"use client";
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export default function ReturnsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 mb-8 transition-colors">
        <ArrowLeft size={16} /> Back to Home
      </Link>
      <h1 className="text-4xl font-black text-slate-900 mb-6">Returns Centre</h1>
      <div className="glass-card p-8 bg-white mb-8">
        <div className="flex items-center gap-4 mb-4">
          <RefreshCw className="text-indigo-600" size={28} />
          <h2 className="text-xl font-bold text-slate-900">Easy Returns Policy</h2>
        </div>
        <ul className="space-y-3 text-slate-600">
          <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold">✓</span> 7-day hassle-free returns on all products</li>
          <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold">✓</span> Refund processed within 3-5 business days</li>
          <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold">✓</span> Free pickup from your doorstep</li>
          <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold">✓</span> No questions asked for verified products</li>
        </ul>
      </div>
      <p className="text-slate-500">
        To initiate a return, go to <Link href="/profile" className="text-indigo-600 font-bold hover:underline">Your Account</Link> → Orders → Select the order → Request Return.
      </p>
    </div>
  );
}
