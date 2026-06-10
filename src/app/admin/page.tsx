"use client";

import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-[#090909] text-[#fdfdfd]">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Painel Admin</h1>
          <p className="text-[#9b9b9b]">Acesse as ferramentas de administração</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/admin/agendamentos"
            className="bg-[#111111] border border-white/10 rounded-xl p-8 hover:border-[#19d18e] transition-colors"
          >
            <div className="mb-4">
              <div className="w-12 h-12 bg-[#19d18e]/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">Agendamentos do Dia</h2>
            <p className="text-[#9b9b9b] text-sm">Visualize e gerencie os agendamentos de hoje</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
