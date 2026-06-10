import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const body = await request.json();
  const { telefone, senhaAtual, novaSenha } = body;

  if (!telefone || !senhaAtual || !novaSenha) {
    return NextResponse.json(
      { error: "telefone, senhaAtual e novaSenha são obrigatórios" },
      { status: 400 }
    );
  }

  const telefoneLimpo = telefone.replace(/\D/g, "");
  const cliente = await prisma.cliente.findUnique({ where: { telefone: telefoneLimpo } });

  if (!cliente) {
    return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
  }

  const senhaValida = await bcrypt.compare(senhaAtual, cliente.senhaHash);
  if (!senhaValida) {
    return NextResponse.json({ error: "Senha atual incorreta" }, { status: 401 });
  }

  const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
  await prisma.cliente.update({
    where: { id: cliente.id },
    data: { senhaHash: novaSenhaHash },
  });

  return NextResponse.json({ message: "Senha alterada com sucesso" });
}
