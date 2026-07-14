"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const ADMIN_TOKEN_KEY = "admin_token";
const ADMIN_ROLE_KEY = "admin_role";

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)})${digits.slice(2)}`;
  return `(${digits.slice(0, 2)})${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function AdminPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    const role = localStorage.getItem(ADMIN_ROLE_KEY);
    if (token && role === "barbeiro") {
      setIsLoggedIn(true);
    }
    setChecking(false);
  }, []);

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
      setLoading(true);
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
          text: "Este número não tem acesso ao painel administrativo.",
          background: "#1a1a1a",
          color: "#fdfdfd",
          confirmButtonColor: "#19d18e",
        });
        return;
      }

      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      localStorage.setItem(ADMIN_ROLE_KEY, "barbeiro");
      setIsLoggedIn(true);
      router.push("/admin/agendamentos");
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
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_ROLE_KEY);
    setIsLoggedIn(false);
    setSenha("");
  }

  if (checking) {
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
          <h1 className="text-2xl font-bold mb-2">Painel Admin</h1>
          <p className="text-[#9b9b9b] text-sm mb-6">
            Entre com o número de celular e senha para verificar os agendamentos.
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
              disabled={loading}
              className="w-full bg-[#19d18e] text-[#090909] font-semibold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Verificando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090909] text-[#fdfdfd]">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Painel Admin</h1>
            <p className="text-[#9b9b9b]">Acesse as ferramentas de administração</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm px-4 py-2 rounded-lg border border-white/20 text-[#9b9b9b] hover:text-[#fdfdfd] hover:border-white/40 transition"
          >
            Sair
          </button>
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
