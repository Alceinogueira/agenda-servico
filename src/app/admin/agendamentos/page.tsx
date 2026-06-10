"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";

interface Agendamento {
  id: number;
  nomeCliente: string;
  telefone: string;
  servicoNome: string;
  funcionarioNome: string;
  hora: string;
  status: string;
}

export default function AdminAgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataAtual, setDataAtual] = useState("");

  useEffect(() => {
    const hoje = new Date().toISOString().split("T")[0];
    setDataAtual(hoje);
    fetchAgendamentos(hoje);
  }, []);

  async function fetchAgendamentos(data: string) {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/agendamentos-dia?data=${data}`);
      const result = await res.json();
      if (res.ok) {
        setAgendamentos(result.agendamentos || []);
      }
    } catch (err) {
      console.error("Erro ao buscar agendamentos:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelar(id: number) {
    const result = await Swal.fire({
      title: "Cancelar agendamento?",
      text: "Esta ação não pode ser desfeita.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f12e6a",
      cancelButtonColor: "#343434",
      confirmButtonText: "Sim, cancelar",
      cancelButtonText: "Não",
      background: "#1a1a1a",
      color: "#fdfdfd",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/agendamento/${id}/cancelar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Cancelado",
          text: "Agendamento cancelado.",
          background: "#1a1a1a",
          color: "#fdfdfd",
          confirmButtonColor: "#19d18e",
        });
        fetchAgendamentos(dataAtual);
      } else {
        throw new Error("Erro ao cancelar");
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Não foi possível cancelar.",
        background: "#1a1a1a",
        color: "#fdfdfd",
        confirmButtonColor: "#19d18e",
      });
    }
  }

  function handleDataChange(novaData: string) {
    setDataAtual(novaData);
    fetchAgendamentos(novaData);
  }

  return (
    <div className="min-h-screen bg-[#090909] text-[#fdfdfd]">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Agendamentos - Admin</h1>
          <p className="text-[#9b9b9b]">Visualize e gerencie os agendamentos do dia</p>
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-xl p-6 mb-8">
          <label className="text-sm text-[#4b4a4a] mb-2 block">Data</label>
          <input
            type="date"
            value={dataAtual}
            onChange={(e) => handleDataChange(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-white/20 rounded-lg px-4 py-2 text-[#fdfdfd] focus:outline-none focus:border-[#19d18e]"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#19d18e] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : agendamentos.length === 0 ? (
          <div className="bg-[#111111] border border-white/10 rounded-xl p-12 text-center">
            <p className="text-[#4b4a4a]">Nenhum agendamento para esta data</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-[#9b9b9b] mb-4">
              Total: <span className="font-bold text-[#19d18e]">{agendamentos.length}</span> agendamentos
            </div>
            {agendamentos.map((ag) => (
              <div
                key={ag.id}
                className="bg-[#111111] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-[#4b4a4a] mb-1">Horário</p>
                    <p className="text-lg font-bold text-[#19d18e]">{ag.hora}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#4b4a4a] mb-1">Serviço</p>
                    <p className="font-semibold uppercase">{ag.servicoNome}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#4b4a4a] mb-1">Cliente</p>
                    <p className="font-medium">{ag.nomeCliente}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#4b4a4a] mb-1">Telefone</p>
                    <p className="text-sm">{ag.telefone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#4b4a4a] mb-1">Profissional</p>
                    <p className="text-sm">{ag.funcionarioNome}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#4b4a4a] mb-1">Status</p>
                    <span className="inline-block text-xs px-2 py-1 rounded bg-[#19d18e]/20 text-[#19d18e] font-medium">
                      {ag.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleCancelar(ag.id)}
                  className="w-full text-sm py-2 rounded-lg border border-[#f12e6a] text-[#f12e6a] hover:bg-[#f12e6a]/10 transition-colors"
                >
                  Cancelar Agendamento
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
