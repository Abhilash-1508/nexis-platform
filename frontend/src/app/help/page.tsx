"use client";
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MessageSquare } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 mb-8 transition-colors">
        <ArrowLeft size={16} /> Back to Home
      </Link>
      <h1 className="text-4xl font-black text-slate-900 mb-6">Help Center</h1>
      <p className="text-lg text-slate-600 leading-relaxed mb-10">
        Need help? We&apos;re here for you. Choose one of the options below or use our AI chatbot (bottom-right corner).
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 bg-white text-center hover:shadow-lg transition-shadow">
          <Mail className="mx-auto mb-4 text-indigo-600" size={32} />
          <h3 className="font-bold text-slate-900 mb-2">Email Support</h3>
          <p className="text-sm text-slate-500">support@nexis.com</p>
        </div>
        <div className="glass-card p-6 bg-white text-center hover:shadow-lg transition-shadow">
          <Phone className="mx-auto mb-4 text-indigo-600" size={32} />
          <h3 className="font-bold text-slate-900 mb-2">Phone</h3>
          <p className="text-sm text-slate-500">+91 800-NEXIS-00</p>
        </div>
        <div className="glass-card p-6 bg-white text-center hover:shadow-lg transition-shadow">
          <MessageSquare className="mx-auto mb-4 text-indigo-600" size={32} />
          <h3 className="font-bold text-slate-900 mb-2">Live Chat</h3>
          <p className="text-sm text-slate-500">Use the chat button →</p>
        </div>
      </div>
    </div>
  );
}
