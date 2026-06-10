"use client";

import { useState } from "react";
import Swal from "sweetalert2";

export default function RecuperarSenhaPage() {
  const [telefone, setTelefone] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"solicitar" | "confirmar">("solicitar");

  function formatPhone(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)})${digits.slice(2)}`;
    return `(${digits.slice(0, 2)})${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  async function handleEnviarCodigo() {
    if (!telefone.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Atenção",
        text: "Informe o telefone cadastrado.",
        background: "#1a1a1a",
        color: "#fdfdfd",
        confirmButtonColor: "#19d18e",
      });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/solicitar-reset-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefone: telefone.replace(/\D/g, "") }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao enviar código.");
      }

      Swal.fire({
        icon: "success",
        title: "Código enviado",
        text: "Verifique seu WhatsApp e use o código nos próximos 15 minutos.",
        background: "#1a1a1a",
        color: "#fdfdfd",
        confirmButtonColor: "#19d18e",
      });
      setStep("confirmar");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: (err as Error).message || "Não foi possível enviar o código.",
        background: "#1a1a1a",
        color: "#fdfdfd",
        confirmButtonColor: "#19d18e",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmarCodigo() {
    if (!telefone.trim() || !codigo.trim() || !novaSenha.trim() || !confirmSenha.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Atenção",
        text: "Preencha todos os campos.",
        background: "#1a1a1a",
        color: "#fdfdfd",
        confirmButtonColor: "#19d18e",
      });
      return;
    }

    if (novaSenha !== confirmSenha) {
      Swal.fire({
        icon: "warning",
        title: "Atenção",
        text: "As senhas não coincidem.",
        background: "#1a1a1a",
        color: "#fdfdfd",
        confirmButtonColor: "#19d18e",
      });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/confirmar-reset-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telefone: telefone.replace(/\D/g, ""),
          codigo,
          novaSenha,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao redefinir a senha.");
      }

      Swal.fire({
        icon: "success",
        title: "Senha redefinida",
        text: data.message || "Sua senha foi atualizada com sucesso.",
        background: "#1a1a1a",
        color: "#fdfdfd",
        confirmButtonColor: "#19d18e",
      });
      setCodigo("");
      setNovaSenha("");
      setConfirmSenha("");
      setStep("solicitar");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: (err as Error).message || "Não foi possível redefinir a senha.",
        background: "#1a1a1a",
        color: "#fdfdfd",
        confirmButtonColor: "#19d18e",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#090909] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-[#111111] border border-white/10 rounded-3xl p-8 shadow-lg shadow-black/30">
        <h1 className="text-2xl font-semibold text-[#fdfdfd] mb-4">Recuperar Senha</h1>
        <p className="text-sm text-[#9b9b9b] mb-6">
          Informe seu telefone para receber um código de verificação no WhatsApp.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#4b4a4a] mb-1 block">Telefone</label>
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(formatPhone(e.target.value))}
              placeholder="(XX)XXXXX-XXXX"
              className="w-full bg-[#1a1a1a] border border-white/20 rounded-xl px-4 py-3 text-[#fdfdfd] text-sm placeholder:text-[#4b4a4a] focus:outline-none focus:border-[#19d18e]"
            />
          </div>

          {step === "confirmar" && (
            <>
              <div>
                <label className="text-xs text-[#4b4a4a] mb-1 block">Código</label>
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="000000"
                  className="w-full bg-[#1a1a1a] border border-white/20 rounded-xl px-4 py-3 text-[#fdfdfd] text-sm placeholder:text-[#4b4a4a] focus:outline-none focus:border-[#19d18e]"
                />
              </div>
              <div>
                <label className="text-xs text-[#4b4a4a] mb-1 block">Nova Senha</label>
                <input
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Nova senha"
                  className="w-full bg-[#1a1a1a] border border-white/20 rounded-xl px-4 py-3 text-[#fdfdfd] text-sm placeholder:text-[#4b4a4a] focus:outline-none focus:border-[#19d18e]"
                />
              </div>
              <div>
                <label className="text-xs text-[#4b4a4a] mb-1 block">Confirmar Nova Senha</label>
                <input
                  type="password"
                  value={confirmSenha}
                  onChange={(e) => setConfirmSenha(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full bg-[#1a1a1a] border border-white/20 rounded-xl px-4 py-3 text-[#fdfdfd] text-sm placeholder:text-[#4b4a4a] focus:outline-none focus:border-[#19d18e]"
                />
              </div>
            </>
          )}

          {step === "solicitar" ? (
            <button
              onClick={handleEnviarCodigo}
              disabled={loading}
              className="w-full bg-[#19d18e] text-black font-bold uppercase py-3 rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar código"}
            </button>
          ) : (
            <button
              onClick={handleConfirmarCodigo}
              disabled={loading}
              className="w-full bg-[#19d18e] text-black font-bold uppercase py-3 rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
            >
              {loading ? "Confirmando..." : "Redefinir senha"}
            </button>
          )}

          {step === "confirmar" && (
            <button
              onClick={() => setStep("solicitar")}
              className="w-full text-sm text-[#4b4a4a] hover:text-[#19d18e]"
            >
              Voltar para enviar outro código
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
