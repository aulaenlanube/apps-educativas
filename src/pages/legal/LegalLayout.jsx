import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function LegalLayout({ title, updatedAt, children }) {
  return (
    <div className="min-h-[calc(100vh-300px)] bg-gradient-to-br from-slate-50 to-slate-100 py-10 px-4">
      <div className="mx-auto max-w-3xl bg-white shadow-sm border border-slate-200 rounded-2xl p-6 sm:p-10 text-slate-800">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">{title}</h1>
        {updatedAt && (
          <p className="text-xs text-slate-500 mb-8">Última actualización: {updatedAt}</p>
        )}
        <div className="prose prose-slate max-w-none text-[15px] leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
