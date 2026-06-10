import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const body = await request.json();
  const { telefone, senha } = body;

  const cliente = await prisma.cliente.findUnique({
    where: { telefone },
  });

  if (!cliente) {
    return NextResponse.json({ debug: "Cliente não encontrado", telefone });
  }

  const senhaValida = await bcrypt.compare(senha, cliente.senhaHash);

  return NextResponse.json({
    debug: "Teste de senha",
    cliente: {
      id: cliente.id,
      nome: cliente.nome,
      telefone: cliente.telefone,
    },
    senhaHash: cliente.senhaHash,
    senhaFornecida: senha,
    senhaValida,
    role: cliente.telefone === "73981337571" ? "barbeiro" : "cliente",
  });
}
