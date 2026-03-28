"use client";
import Link from 'next/link';
import { ArrowLeft, Briefcase } from 'lucide-react';

export default function CareersPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 mb-8 transition-colors">
        <ArrowLeft size={16} /> Back to Home
      </Link>
      <h1 className="text-4xl font-black text-slate-900 mb-6">Careers at Nexis</h1>
      <div className="glass-card p-8 bg-white mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Briefcase className="text-indigo-600" size={28} />
          <h2 className="text-xl font-bold text-slate-900">Join Our Team</h2>
        </div>
        <p className="text-slate-600 leading-relaxed">
          We&apos;re building the future of sustainable commerce. If you&apos;re passionate about technology,
          sustainability, and creating impact, we&apos;d love to hear from you.
        </p>
      </div>
      <p className="text-slate-500">
        Send your resume to <a href="mailto:careers@nexis.com" className="text-indigo-600 font-bold hover:underline">careers@nexis.com</a>
      </p>
    </div>
  );
}
