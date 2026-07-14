"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const ADMIN_TOKEN_KEY = "admin_token";
const ADMIN_ROLE_KEY = "admin_role";

interface Agendamento {
  id: number;
  nomeCliente: string;
  telefone: string;
  servicoNome: string;
  funcionarioNome: string;
  hora: string;
  status: string;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)})${digits.slice(2)}`;
  return `(${digits.slice(0, 2)})${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function AdminAgendamentosPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataAtual, setDataAtual] = useState("");

  useEffect(() => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    const role = localStorage.getItem(ADMIN_ROLE_KEY);
    const hoje = new Date().toISOString().split("T")[0];
    setDataAtual(hoje);

    if (token && role === "barbeiro") {
      setIsLoggedIn(true);
      fetchAgendamentos(hoje, token);
    }
    setCheckingAuth(false);
  }, []);

  async function fetchAgendamentos(data: string, tokenOverride?: string) {
    const token = tokenOverride || localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) {
      handleLogout();
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/admin/agendamentos-dia?data=${data}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        handleLogout();
        Swal.fire({
          icon: "error",
          title: "Sessão expirada",
          text: "Faça login novamente para continuar.",
          background: "#1a1a1a",
          color: "#fdfdfd",
          confirmButtonColor: "#19d18e",
        });
        return;
      }

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

  async function handleLogin(e: FormEvent) {
    e.preventDefault();

    const telefoneLimpo = telefone.replace(/\D/g, "");
    if (!telefoneLimpo || !senha.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Atenção",
        text: "Informe telefone e senha.",
        background: "#1a1a1a",
        color: "#fdfdfd",
        confirmButtonColor: "#19d18e",
      });
      return;
    }

    try {
      setLoginLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefone: telefoneLimpo, senha }),
      });

      const data = await res.json();
      if (!res.ok) {
        Swal.fire({
          icon: "error",
          title: "Acesso negado",
          text: data.error || "Telefone ou senha incorretos.",
          background: "#1a1a1a",
          color: "#fdfdfd",
          confirmButtonColor: "#19d18e",
        });
        return;
      }

      if (data?.cliente?.role !== "barbeiro") {
        Swal.fire({
          icon: "error",
          title: "Sem permissão",
          text: "Este número não tem acesso ao painel de agendamentos.",
          background: "#1a1a1a",
          color: "#fdfdfd",
          confirmButtonColor: "#19d18e",
        });
        return;
      }

      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      localStorage.setItem(ADMIN_ROLE_KEY, "barbeiro");
      setIsLoggedIn(true);
      fetchAgendamentos(dataAtual || new Date().toISOString().split("T")[0], data.token);
    } catch {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Não foi possível fazer login. Tente novamente.",
        background: "#1a1a1a",
        color: "#fdfdfd",
        confirmButtonColor: "#19d18e",
      });
    } finally {
      setLoginLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_ROLE_KEY);
    setIsLoggedIn(false);
    setAgendamentos([]);
    setSenha("");
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
      const token = localStorage.getItem(ADMIN_TOKEN_KEY);
      const res = await fetch(`/api/agendamento/${id}/cancelar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
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
    } catch {
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

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#090909] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#19d18e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#090909] text-[#fdfdfd] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#111111] border border-white/10 rounded-xl p-8">
          <h1 className="text-2xl font-bold mb-2">Agendamentos - Admin</h1>
          <p className="text-[#9b9b9b] text-sm mb-6">
            Login por celular para verificar se o acesso está autorizado.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm text-[#9b9b9b] mb-2 block">Celular</label>
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(formatPhone(e.target.value))}
                placeholder="(00)00000-0000"
                className="w-full bg-[#1a1a1a] border border-white/20 rounded-lg px-4 py-3 text-[#fdfdfd] focus:outline-none focus:border-[#19d18e]"
              />
            </div>
            <div>
              <label className="text-sm text-[#9b9b9b] mb-2 block">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Sua senha"
                className="w-full bg-[#1a1a1a] border border-white/20 rounded-lg px-4 py-3 text-[#fdfdfd] focus:outline-none focus:border-[#19d18e]"
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-[#19d18e] text-[#090909] font-semibold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {loginLoading ? "Verificando..." : "Entrar"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="w-full mt-4 text-sm text-[#9b9b9b] hover:text-[#fdfdfd]"
          >
            Voltar ao painel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090909] text-[#fdfdfd]">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Agendamentos - Admin</h1>
            <p className="text-[#9b9b9b]">Visualize e gerencie os agendamentos do dia</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm text-[#9b9b9b] hover:text-[#fdfdfd]">
              Painel
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm px-4 py-2 rounded-lg border border-white/20 text-[#9b9b9b] hover:text-[#fdfdfd] hover:border-white/40 transition"
            >
              Sair
            </button>
          </div>
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
