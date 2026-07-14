import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBarbeiro } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = requireBarbeiro(request.headers.get("Authorization"));
  if (!auth) {
    return NextResponse.json({ error: "Acesso não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const data = searchParams.get("data");

  if (!data) {
    return NextResponse.json({ error: "Data é obrigatória" }, { status: 400 });
  }

  const agendamentos = await prisma.agendamento.findMany({
    where: {
      data,
      status: { not: "cancelado" },
    },
    include: {
      servico: true,
      funcionario: true,
    },
    orderBy: { hora: "asc" },
  });

  return NextResponse.json({
    data,
    agendamentos: agendamentos.map((a) => ({
      id: a.id,
      nomeCliente: a.nomeCliente,
      telefone: a.telefone,
      servicoNome: a.servico.nome,
      funcionarioNome: a.funcionario.nome,
      hora: a.hora,
      status: a.status,
    })),
  });
}
