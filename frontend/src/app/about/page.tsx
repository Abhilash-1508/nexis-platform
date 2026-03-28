"use client";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 mb-8 transition-colors">
        <ArrowLeft size={16} /> Back to Home
      </Link>
      <h1 className="text-4xl font-black text-slate-900 mb-6">About Nexis</h1>
      <p className="text-lg text-slate-600 leading-relaxed mb-6">
        Nexis is India&apos;s leading marketplace for certified refurbished electronics and sustainable goods.
        We believe in a circular economy where quality products get a second life, reducing e-waste and
        making technology accessible to everyone.
      </p>
      <p className="text-lg text-slate-600 leading-relaxed">
        Founded in 2024, Nexis verifies every product through a rigorous 48-point inspection process,
        ensuring you receive only the best. Join 45,000+ satisfied customers in our mission to build
        a more sustainable future.
      </p>
    </div>
  );
}
