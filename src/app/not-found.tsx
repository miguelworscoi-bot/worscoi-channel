import React from 'react';
import { Link } from '@/app/navigation';
import { Gamepad2, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="text-center py-24 px-4 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6">
        <Gamepad2 className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-white mb-2">404</h1>
      <h2 className="text-lg font-semibold text-slate-300 mb-3">Página não encontrada</h2>
      <p className="text-sm text-slate-400 mb-8">
        A rota solicitada não existe ou foi movida. Explore as promoções ativas na página inicial.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para Ofertas
      </Link>
    </div>
  );
}
